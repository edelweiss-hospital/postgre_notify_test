const createPostgresSubscriber = require('pg-listen/index')

class DbSubscriber {

    // change me
    databaseURL = 'postgresql://username:password@host:port/dbname'

    constructor() {
        this.subscriber = createPostgresSubscriber({ connectionString: this.databaseURL })
    }

    connect(channels) {
        this.subscriber.events.on("error", (error) => {
            console.error("Fatal database connection error:", error)
        })

        process.on("exit", () => {
            this.subscriber.close()
        })

        for (const channel of channels) {
            this.subscriber.notifications.on(channel.name, (payload) => {
                channel.callback(payload)
            })
        }

        this.subscriber.connect().then(() => {
            for (const channel of channels) {
                this.subscriber.listenTo(channel.name)
            }
        })
    }

    disconnect() {
        if (this.subscriber)
            this.subscriber.close()
    }
}

const dbSubscriber = new DbSubscriber()
console.log('listening event for regpatient database changes')
dbSubscriber.connect([
    // listen for regpatient db changes
    {
        name: 'notify_regpatient',
        callback: (payload) => {
            console.log("new event captured")
            console.log(payload)
        }
    }
])