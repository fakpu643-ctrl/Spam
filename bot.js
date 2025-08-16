const fs = require("fs");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const schedule = require("node-schedule");
const axios = require("axios");

// ---------- Konfigurasi ----------
const accounts = [
  {
    name: "Akun 1",
    apiId: 29587265, // Ganti dengan API ID akun 1
    apiHash: "4111592828f7580d6b87b6d7199e59f5", // Ganti dengan API Hash akun 1
    session: new StringSession("1BQANOTEuMTA4LjU2LjIwMAG7UdUzqZdxwCBEaGATsUYgEDocABv3RWzTy45UX6QSJeNY1PKj+n7IZceMd1iWw1BRslAMgvdCALv3VLD2bO3Xmpe776H+cAk4FkKtTj3IdQ+oRjL8h2vZnuhqVfjzpMsWk1k6ArXE++3a2Mmm/d1YWGlAQtyFRhwwXstYuQgUFTsYgTk7FcvsNGh4wNpDzQDRMXk0yqRtJbu1OBamy3NxsqsnvIOrf1B1xTfUzAFN5/sJEcna+kyXEjFV0f5I2a6ZbRcQW4lZ4f1E36sooef9QSKVQEf2sdohyTXZ75v0Mi3Va6kGj12gveSyCLhIoH3NaQivuVnzQ37nEQhSDj1ujQ=="),
  },
  {
    name: "Akun 2",
    apiId: 22467930, // Ganti dengan API ID akun 2
    apiHash: "aa8001b5a53dd34b332eacf1f5e82357", // Ganti dengan API Hash akun 2
    session: new StringSession("1BQANOTEuMTA4LjU2LjIwMAG7Td931weO6yen1yr0KgjtCfJi/etRuGxPzdLWGu7GkgNRKkPAsyB91UF8n1EUuZyLYmrr1wAHxPJuAb7xFX0ypF/l1LIxvnMBWNU4wv3UK/FXUAfqksGen29SkSK4wX5vew0+nrc6b0/nwV4umolioEr80TPxRNKYyb9yam0D3eDg+9vFi6Vk43ctssDP6VDk0yjYffezcU8kcsqC5hFN0w3+hur1tlMWwItiFumhcY2svBxZljMSxSl8mMfoDD0PMqNvaWmislkJlE7R2lnafssz6Ulz9yi8oI3WG8lcd/RKT1S6GzjQFXoZ8soXxDMizwwJa66QnmJxiDZ5jmB4Fw=="),
  },
];

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
const TELEGRAM_BOT_TOKEN = "8087072861:AAHuZA5fuXLhvPhGB945GWhbSkCzVxSZrEM"; // Pastikan token ini milik kamu sendiri
const TELEGRAM_CHAT_ID = "6468926488"; // Ganti dengan ID kamu

// Fungsi kirim log ke Telegram bot
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

// Fungsi log ke file
function logToFile(message) {
  const logMsg = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync("telegram_log.txt", logMsg);
}

// ---------- Proses Kirim Pesan ----------
let currentIndex = 0;

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

// ---------- Jadwalkan tiap 15 menit ----------
schedule.scheduleJob("*/10 * * * *", () => {
  const account = accounts[currentIndex];
  console.log(`\n[${new Date().toISOString()}] Menjalankan ${account.name}`);
  sendMessageFromAccount(account);
  currentIndex = (currentIndex + 1) % accounts.length;
});


console.log("Bot aktif dan menunggu jadwal setiap 15 menit...");
