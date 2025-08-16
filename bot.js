const fs = require("fs");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const schedule = require("node-schedule");
const axios = require("axios");

// ---------- Konfigurasi Akun Telegram ----------
const accounts = [
  {
    name: "Akun 1",
    apiId: 29587265,
    apiHash: "4111592828f7580d6b87b6d7199e59f5",
    session: new StringSession("1BQANOTEuMTA4LjU2LjIwMAG7H2yJMgzEM1l3Rjv+QzptAwH9yEeJ+sFKOzzu+KgVw1idARcpheacm8MF33ZeRf3wunFUR9nJEU2NhOZlMWcCdCWXe2R7hrbXO1k6pYdyfFbHujin36LRl2pQljcb6sQsvQ2dzDdOtG71Ja5ubCZrxLv7ZxrJnTN65GH39x+5gyoRC3xCXBRCy42iOPYm5BbbjwgCJv3SEG4FQANx32iEkH0KEIXrn/R+sdvlITvmTLQ52EKOPq0sgiGqO8AnGltQvOQGPKh2kLbeEmINsFoSQI5PF+HvzxwKoyOH3X1bpJAXnY6nP/fNkIp3tXAIVMDraB7TdSgt7xVU6JzBTbxGig=="),
  },
  {
    name: "Akun 2",
    apiId: 22467930,
    apiHash: "aa8001b5a53dd34b332eacf1f5e82357",
    session: new StringSession("1BQANOTEuMTA4LjU2LjIwMAG7lSSZZz4cbFV3XLV7wV8yEKyKjJt4tvuU5U19i9CFa20mvVgyof8MLRPw9XpF8s3hV9yZFdeYXAdVhZ5GO+YfgNfTWOUjOgeNix+G2UYQINISbEmlcNpb5oF57RX435Dru9Sw9Jte9UnB8rAa2fJ2lRTiYdMjTp/FrVs1/kKUK8PSnpfFVUr7FVYDJcwKnjsfYaCWuU7gTJetw51Tp90cJKb/Lbb56gmY3kzvajO5WcO8rnlYwQ1gnnMrlpiX0PZvXM/eF7v1oY86wmaJrSY+3x/rg9DBd9sdhSqSvidMVf6/kukHIapSa3o6/E7Koe0YJcMCFz9AfnrBwIU4JBt2Hg=="),
  },
  {
    name: "Akun 3",
    apiId: 25922161, // Ganti dengan API ID akun ke-3
    apiHash: "1ac23eeec768f729c4e8fe81c9a29d80", // Ganti dengan API Hash akun ke-3
    session: new StringSession("1BQANOTEuMTA4LjU2LjIwMAG7ULyAJj//0ZSGk9ZebXxBxUdELhf/Tjn/S4meLfu/DxRYkfbCfezCrJbvLnD94VGHLrUr9YkrHhfkglCMH9yH6h7X+Dc1bUouMPYUD7qZ8weLf6FwOK2waAd/T8iQNxbT/bFmAOvr8vtq6vNN3G49brW/UO+OsyCHgb5ZqyUZQbB3LmEW7wJ2TtlyZMmAdFdRXS2/UcKxht7ZEdgY21bB4DYX9GVVBb6j856jgCRPpknejF4aTwwr1I6gLVMZGPwDSCvrZt+RqDUq6lsQoHHrhWOaIYDwWxk44HTiyqYBaBXBajpXES3n8UI7/HgG1I6+H77j8anGnchaEi4Drmesyg=="),
  },
];

// ---------- Grup Tujuan ----------
const groupUsernames = [
  "@lpm_seme_uke",
  "@lpmSemeUkeRpA",
  "@lpm_seme_uke_rpx",
];

// ---------- Pesan Yang Akan Dikirim ----------
const messageToSend = `
ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1

ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1

ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1

ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1

ch b0k*p bxb https://t.me/+GDXb7qYaLytkNDA1
#seme #uke #area
`.trim();

// ---------- Bot Log Telegram (Opsional) ----------
const TELEGRAM_BOT_TOKEN = "8087072861:AAHuZA5fuXLhvPhGB945GWhbSkCzVxSZrEM"; // Token bot
const TELEGRAM_CHAT_ID = "6468926488"; // ID chat untuk log

// ---------- Fungsi Logging ----------
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

// ---------- Fungsi Utama untuk Kirim Pesan ----------
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

// ---------- Penjadwalan Setiap 10 Menit untuk Setiap Akun ----------
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

console.log("✅ Bot aktif dan dijadwalkan setiap 10 menit per akun (rotasi 3 akun)...");
