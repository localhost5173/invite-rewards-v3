export const data = {
    name: "test",
    description: "test command",
};
export async function run({ interaction }) {
    await interaction.reply({
        content: "test",
        ephemeral: true,
    });
}
export const options = {
    devOnly: true,
    userPermissions: ["Administrator"],
    botPermissions: ["Administrator"],
    deleted: false,
    onlyGuild: true,
    voteLocked: true,
};
