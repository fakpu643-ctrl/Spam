const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm install input

const apiId = 22467930; // ganti dengan API ID kamu
const apiHash = "aa8001b5a53dd34b332eacf1f5e82357"; // ganti dengan API HASH kamu
const stringSession = new StringSession(""); // kosongkan untuk login

(async () => {
  console.log("Logging in...");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Masukkan nomor telepon kamu: "),
    password: async () => await input.text("Masukkan 2FA password (jika ada): "),
    phoneCode: async () => await input.text("Masukkan kode OTP dari Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("Berhasil login!");
  console.log("Session string kamu (simpan ini dengan aman):");
  console.log(client.session.save()); // Ini yang kamu salin ke bot utama
})();
