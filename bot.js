require("dotenv").config(); // Tambahkan ini paling atas

const fs = require("fs");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const schedule = require("node-schedule");
const axios = require("axios");

// ---------- Konfigurasi ----------
const accounts = [
  {
    name: "Akun 1",
    apiId: 29587265,
    apiHash: "4111592828f7580d6b87b6d7199e59f5",
    session: new StringSession(process.env.SESSION_1 || ""),
  },
  {
    name: "Akun 2",
    apiId: 22467930,
    apiHash: "aa8001b5a53dd34b332eacf1f5e82357",
    session: new StringSession(process.env.SESSION_2 || ""),
  },
  {
    name: "Akun 3",
    apiId: 25922161,
    apiHash: "1ac23eeec768f729c4e8fe81c9a29d80",
    session: new StringSession(process.env.SESSION_3 || ""),
  },
];

// Validasi session agar tidak crash
for (const account of accounts) {
  if (!account.session || account.session.save() === "") {
    throw new Error(`❌ Session string kosong atau tidak valid pada akun: ${account.name}`);
  }
}

const groupUsernames = ["@lpm_seme_uke", "@lpmSemeUkeRpA", "@lpm_seme_uke_rpx"];

const messageToSend = `
ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1

ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1

ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1

ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1

ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1
#seme #uke #area
`.trim();

// ---------- Bot Telegram pribadi ----------
const TELEGRAM_BOT_TOKEN = "8087072861:AAHuZA5fuXLhvPhGB945GWhbSkCzVxSZrEM";
const TELEGRAM_CHAT_ID = "6468926488";

async function sendLogToTelegram(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error("Gagal kirim notifikasi ke Telegram:", err.message);
  }
}

function logToFile(message) {
  const logMsg = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync("telegram_log.txt", logMsg);
}

async function sendMessageFromAccount(account) {
  const client = new TelegramClient(account.session, account.apiId, account.apiHash, {
    connectionRetries: 5,
  });

  let resultLog = `🔁 ${account.name} mengirim pesan:\n`;

  try {
    await client.connect();

    for (const group of groupUsernames) {
      try {
        await client.sendMessage(group, { message: messageToSend });
        const msg = `✅ Berhasil kirim ke ${group}`;
        resultLog += msg + "\n";
        console.log(`[${account.name}] ${msg}`);
      } catch (err) {
        const msg = `❌ Gagal kirim ke ${group}: ${err.message}`;
        resultLog += msg + "\n";
        console.error(`[${account.name}] ${msg}`);
      }
    }
  } catch (err) {
    const msg = `❗ Gagal koneksi ke Telegram: ${err.message}`;
    resultLog += msg + "\n";
    console.error(msg);
  } finally {
    await client.disconnect();
    logToFile(resultLog);
    await sendLogToTelegram(resultLog);
  }
}

// ---------- Penjadwalan Per Akun ----------
schedule.scheduleJob("0 */30 * * * *", () => {
  console.log(`[${new Date().toISOString()}] Menjalankan Akun 1`);
  sendMessageFromAccount(accounts[0]);
});

schedule.scheduleJob("10 */30 * * * *", () => {
  console.log(`[${new Date().toISOString()}] Menjalankan Akun 2`);
  sendMessageFromAccount(accounts[1]);
});

schedule.scheduleJob("20 */30 * * * *", () => {
  console.log(`[${new Date().toISOString()}] Menjalankan Akun 3`);
  sendMessageFromAccount(accounts[2]);
});

console.log("Bot aktif. Menjadwalkan pengiriman setiap 10 menit bergantian antar akun...");
