const dotenv = require("dotenv");
dotenv.config();
const config = require("./config");
const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.once("ready", () => {
    console.log(`Logged in as:`, client.user.tag);
});

client.on("messageCreate", async (message) => {
    if (message.content === "auauVerify114514") {
        const verifyBtn = new ButtonBuilder()
        .setCustomId("verifyBtn")
        .setLabel("認証")
        .setStyle(ButtonStyle.Success);
        const row = new ActionRowBuilder()
        .addComponents(verifyBtn);
        await message.channel.send({
            embeds: [
                {
                    content: "✓ 認証",
                    description: "このサーバーに参加するには以下のボタンを押して簡単な問題に答える必要があります。"
                }
            ],
            components: [row]
        });
    }
});

function randomString() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
}

client.on("interactionCreate", async (interaction) => {
    if (interaction.customId === "verifyBtn") {
        const member = interaction.member;
        const roleId = config.roleId;
        const hasRole = member.roles.cache.some(role => role.id === roleId);
        if (hasRole) {
            return await interaction.reply({
                content: "既に認証済みです。この操作は不要です。",
                ephemeral: true
            });
        }
        const randomWord = randomString();
        const modal = new ModalBuilder()
            .setCustomId(randomWord)
            .setTitle("テキスト認証");
        const textInput = new TextInputBuilder()
            .setCustomId("textInput")
            .setLabel(`次のワードを入力してください: "${randomWord}"`)
            .setStyle(TextInputStyle.Short)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const actionRow = new ActionRowBuilder().addComponents(textInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);
        client.on("interactionCreate", async (modalInteraction) => {
            if (!modalInteraction.isModalSubmit()) return;
            if (modalInteraction.customId = randomWord) {
                const roleId = config.roleId;
                const member = modalInteraction.guild.members.cache.get(modalInteraction.user.id);
                const userInput = modalInteraction.fields.getTextInputValue("textInput");
                if (userInput === randomWord) {
                    const channelId = config.channelId;
                    const channel = client.channels.cache.get(channelId);
                    await modalInteraction.reply({
                        content: `✓ 認証が完了しました。\n**${modalInteraction.guild.name}**へようこそ！`,
                        ephemeral: true
                    });
                    await member.roles.add(roleId);
                    await channel.send(`<@${modalInteraction.user.id}>が参加しました！`);
                } else {
                    await modalInteraction.reply({
                        content: "認証失敗。もう一度お試しください。",
                        ephemeral: true
                    });
                }
            }
        });
    }
});

client.login(process.env.DISCORD_TOKEN);