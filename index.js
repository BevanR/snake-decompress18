const five = require('johnny-five')
const Oled = require('oled-js')
const font = require('oled-font-5x7')

const segmentLength = 3
const frameRate = 250
const oledCharacteristics = {
    width: 128,
    height: 64,
    address: 0x3C,
}
const half = oledCharacteristics.height / 2
const initialLength = half / 2

const snake = {
    direction: 'right',
    segments: [],
}
const count = Math.round(initialLength / segmentLength)
for (let i = 0; i < count; i++) {
    const x = half + i * segmentLength
    snake.segments.push({
        start: {
            x: x,
            y: half,
        },
        end: {
            x: x + segmentLength,
            y: half,
        },
    })
}

const board = new five.Board()

board.on('ready', function () {
    const screen = new Oled(board, five, oledCharacteristics);

    // Initialize
    screen.clearDisplay()
    screen.update()
    bindButtons()

    console.log('Starting render loop')
    // Render loop.
    setInterval(() => {
        // console.log('Rendering')
        // Add a new segment to the head.
        const lastSegment = snake.segments[snake.segments.length - 1]
        const start = lastSegment.end
        const end = {...start}
        if (snake.direction === 'right') {
            end.x += segmentLength
        }
        if (snake.direction === 'left') {
            end.x -= segmentLength
        }
        if (snake.direction === 'up') {
            end.y -= segmentLength
        }
        if (snake.direction === 'down') {
            end.y += segmentLength
        }

        if (start.x < 0
            || start.x >= oledCharacteristics.width
            || start.y < 0
            || start.y >= oledCharacteristics.height
        ) {
            screen.setCursor(10, 10)
            screen.writeString(font, 2, 'Game over :(')
            // TODO Stop render loop.
        }

        snake.segments.push({start, end})

        // Render the snake's tail.
        screen.drawLine(start.x, start.y, end.x, end.y, 1, false)

        // Make the tail follow.
        const tail = snake.segments.shift()
        screen.drawLine(tail.start.x, tail.start.y, tail.end.x, tail.end.y, 0)

        // screen.update()
    }, frameRate)
});


function bindButtons() {
    // Unused
    // const startButton = new five.Button(6);
    // const selectButton = new five.Button(7);
    // const joystickButton = new five.Button({
    //     pin: 8,
    //     invert: true,
    // });

    const up = new five.Button(2)
    const down = new five.Button(4)
    const left = new five.Button(5)
    const right = new five.Button(3)

    const eventName = 'up'
    up.on(eventName, () => {
        snake.direction = 'up'
    })
    down.on(eventName, () => {
        snake.direction = 'down'
    })
    left.on(eventName, () => {
        snake.direction = 'left'
    })
    right.on(eventName, () => {
        snake.direction = 'right'
    })
}