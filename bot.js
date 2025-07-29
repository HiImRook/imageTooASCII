const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js')
require('dotenv').config()
let Jimp
try {
  Jimp = require('jimp')
  if (typeof Jimp.read !== 'function') {
    throw new Error('Jimp.read is not a function - module may be misconfigured')
  }
  console.log('Jimp module loaded successfully')
} catch (error) {
  console.error('Jimp Load Error:', error)
  process.exit(1)
}
const { createCanvas } = require('canvas')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

async function imageToAscii(imageBuffer) {
  try {
    const image = await Jimp.read(imageBuffer)
    image.greyscale()
    const { width, height } = image.bitmap

    let asciiStr = ''
    const asciiChars = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@']
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = Jimp.intToRGBA(image.getPixelColor(x, y))
        const brightness = (pixel.r + pixel.g + pixel.b) / 3
        const index = Math.floor((brightness / 255) * (asciiChars.length - 1))
        asciiStr += asciiChars[index]
      }
      asciiStr += '\n'
    }

    const charWidth = 1.78
    const charHeight = 1.5
    const canvas = createCanvas(Math.round(width * charWidth), Math.round(height * charHeight))
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#55FF55'
    ctx.font = '3px monospace'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    asciiStr.split('\n').forEach((line, y) => {
      ctx.fillText(line, 0, y * charHeight)
    })

    const buffer = canvas.toBuffer('image/png')
    console.log('Buffer format:', buffer.toString('hex', 0, 4))

    return { buffer }
  } catch (error) {
    console.error('ImageToAscii Error:', error)
    return { error: `Error processing image: ${error.message}` }
  }
}

const asciiCommand = new SlashCommandBuilder()
  .setName('ascii')
  .setDescription('Convert an uploaded .png or .jpg image to ASCII art PNG')
  .addAttachmentOption((option) =>
    option
      .setName('image')
      .setDescription('Upload a .png or .jpg image to convert')
      .setRequired(true)
  )

client.once('ready', async () => {
  try {
    console.log(`Logged in as ${client.user.tag}`)
    await client.application.commands.set([asciiCommand])
    console.log('Slash command registered')
    client.user.setPresence({ activities: [{ name: 'ASCII Art', type: 'PLAYING' }], status: 'online' })
  } catch (error) {
    console.error('Ready Event Error:', error)
  }
})

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isCommand() || interaction.commandName !== 'ascii') return

    const attachment = interaction.options.getAttachment('image')
    if (!attachment || (!attachment.contentType.startsWith('image/png') && !attachment.contentType.startsWith('image/jpeg'))) {
      await interaction.reply({ content: 'Please upload a valid .png or .jpg image.', ephemeral: true })
      return
    }

    await interaction.deferReply()

    const response = await fetch(attachment.url)
    const arrayBuffer = await response.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)
    const { buffer, error } = await imageToAscii(imageBuffer)
    if (error) {
      await interaction.editReply({ content: error })
      return
    }

    await interaction.editReply({
      files: [{ attachment: buffer, name: 'ascii_art.png' }],
    })
  } catch (error) {
    console.error('Interaction Error:', error)
    if (interaction.deferred) {
      await interaction.editReply({ content: 'An error occurred while processing the image.' })
    } else {
      await interaction.reply({ content: 'An error occurred while processing the image.', ephemeral: true })
    }
  }
})

const TOKEN = process.env.DISCORD_TOKEN
try {
  client.login(TOKEN)
} catch (error) {
  console.error('Login Error:', error)
}
