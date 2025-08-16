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
    session: new StringSession("1BQANOTEuMTA4LjU2LjIwMAG7UdUzqZdxwCBEaGATsUYgEDocABv3RWzTy45UX6QSJeNY1PKj+n7IZceMd1iWw1BRslAMgvdCALv3VLD2bO3Xmpe776H+cAk4FkKtTj3IdQ+oRjL8h2vZnuhqVfjzpMsWk1k6ArXE++3a2Mmm/d1YWGlAQtyFRhwwXstYuQgUFTsYgTk7FcvsNGh4wNpDzQDRMXk0yqRtJbu1OBamy3NxsqsnvIOrf1B1xTfUzAFN5/sJEcna+kyXEjFV0f5I2a6ZbRcQW4lZ4f1E36sooef9QSKVQEf2sdohyTXZ75v0Mi3Va6kGj12gveSyCLhIoH3NaQivuVnzQ37nEQhSDj1ujQ=="), // Sebaiknya simpan sesi di file terenkripsi
  },
  {
    name: "Akun 2",
    apiId: 22467930,
    apiHash: "aa8001b5a53dd34b332eacf1f5e82357",
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

const TELEGRAM_BOT_TOKEN = "8087072861:AAHuZA5fuXLhvPhGB945GWhbSkCzVxSZrEM"; // Ubah token
const TELEGRAM_CHAT_ID = "6468926488"; // Ubah ID pribadi

// ---------- Fungsi Utility ----------
function logToFile(message) {
  const logMsg = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync("telegram_log.txt", logMsg);
}

async function sendLogToTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error("❗ Gagal kirim log ke Telegram:", err.message);
  }
}

async function sendMessageFromAccount(account) {
  const client = new TelegramClient(account.session, account.apiId, account.apiHash, {
    connectionRetries: 5,
  });

  let resultLog = `🔁 ${account.name} mulai mengirim pesan...\n`;

  try {
    await client.connect();

    for (const group of groupUsernames) {
      try {
        if (!group.startsWith("@")) throw new Error("Username grup tidak valid");

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
    const msg = `❗ Gagal koneksi atau autentikasi: ${err.message}`;
    resultLog += msg + "\n";
    console.error(`[${account.name}] ${msg}`);
  } finally {
    try {
      await client.disconnect();
    } catch (err) {
      console.error("⚠️ Gagal disconnect:", err.message);
    }

    logToFile(resultLog);
    await sendLogToTelegram(resultLog);
  }
}

// ---------- Penjadwalan ----------
let currentIndex = 0;

schedule.scheduleJob("*/10 * * * *", async () => {
  const account = accounts[currentIndex];

  try {
    console.log(`\n[${new Date().toISOString()}] Menjalankan ${account.name}`);
    await sendMessageFromAccount(account);
  } catch (err) {
    console.error(`🔥 ERROR saat menjalankan ${account.name}:`, err.message);
    logToFile(`🔥 ERROR ${account.name}: ${err.message}`);
    await sendLogToTelegram(`🔥 ERROR ${account.name}: ${err.message}`);
  }

  currentIndex = (currentIndex + 1) % accounts.length;
});

console.log("Bot aktif dan dijadwalkan setiap 10 menit...");

