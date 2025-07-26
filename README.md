# imageTooASCII 

A Discord bot that converts PNG images to ASCII art and returns them as PNG files.

## Features

- Converts uploaded .png images to ASCII art
- Returns ASCII art as a styled PNG image
- Uses slash commands and attachment for easy interaction

## Setup

1. Install dependencies: `npm install`
2. Create a `.env` file with your Discord bot token: DISCORD_TOKEN=your_bot_token_here
3. Run the bot: `npm start`  or 'node bot.js'

## Usage

Use the `/ascii` command in Discord chat and attach a .png image to convert it to ASCII art.

## Dependencies

- discord.js: Discord API wrapper
- jimp: Image processing
- canvas: PNG generation
- dotenv: Environment variable management
