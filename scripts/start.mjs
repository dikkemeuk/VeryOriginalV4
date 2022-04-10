import { exec } from "child_process";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const startLavalink = async () => {
    const lavalink = exec("java -jar Lavalink.jar", (errr, stdoutt, stderrr) => {
        if (errr) {
            console.error(errr);
            return;
        }
        console.log(stdoutt);
    })
    return lavalink
}

const start = async () => {
    await startLavalink()
    await sleep(5000)
    const bot = exec("node .", (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
            }
            console.log(stdout);
    })

    return bot
}

const bot = await start()
bot.stdout.pipe(process.stdout);

console.log("Bot and Lavalink are running!");