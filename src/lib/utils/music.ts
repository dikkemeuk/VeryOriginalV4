export function filledBar(elapsed: number, total: number) {
    //create a bar of 20 characters
    const barLength = 20;

    //make a bar of the specified length
    let bar = "";
    for(let i = 0; i < barLength; i++) {
        //add a character to the bar
        bar += "=";
    }

    //calculate the amount of "█" to represent the elapsed time
    const elapsedBarLength = Math.floor(elapsed / total * barLength);

    //add the elapsed time to the bar
    bar = bar.substr(0, elapsedBarLength) + "▶️ " + bar.substr(elapsedBarLength + 1);

    //return the bar
    return bar;

}