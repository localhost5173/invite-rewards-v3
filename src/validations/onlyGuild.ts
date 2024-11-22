import type { ValidationProps } from "commandkit";

export default function ({ interaction, commandObj }: ValidationProps) {
  if (!interaction.guild && commandObj.options?.onlyGuild) {
    if ("reply" in interaction) {
      const locales: { [key: string]: string } = {
        en: "This command can only be used in a server.",
        es: "Este comando solo se puede usar en un servidor.",
        fr: "Cette commande ne peut être utilisée que dans un serveur.",
        de: "Dieser Befehl kann nur in einem Server verwendet werden.",
        pt: "Este comando só pode ser usado em um servidor.",
        ru: "Эту команду можно использовать только на сервере.",
        zh: "此命令只能在服务器中使用。",
        ar: "يمكن استخدام هذا الأمر فقط في الخادم.",
        hi: "इस कमांड का उपयोग केवल सर्वर में किया जा सकता है।",
        ja: "このコマンドはサーバーでのみ使用できます。",
        it: "Questo comando può essere utilizzato solo in un server.",
        ko: "이 명령은 서버에서만 사용할 수 있습니다.",
        tr: "Bu komut yalnızca bir sunucuda kullanılabilir.",
        vi: "Lệnh này chỉ có thể được sử dụng trong máy chủ.",
        th: "คำสั่งนี้สามารถใช้ได้เฉพาะในเซิร์ฟเวอร์เท่านั้น",
        id: "Perintah ini hanya dapat digunakan di server.",
      };

      const userLocale: string = interaction.locale || "en";
      const message = locales[userLocale] || locales.en;

      interaction.reply({
        content: message,
        ephemeral: true,
      });
    }
    return true;
  }
}