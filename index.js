const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//  middleware 

app.use(cors())
app.use(express.json())

const user = process.env.BD_User
const password = process.env.BD_Password



app.get('/', (req, res) => {
    res.send({
        message: 'this server is connected'
    })
})

const uri = `mongodb+srv://${user}:${password}@cluster0.5rnuhbi.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const ProductCollection = client.db('Resale-market').collection('allProduct')


        app.get('/allProducts', async (req, res) => {
            const query = {};
            const products = await ProductCollection.find(query).toArray()
            res.send(products);
        })
        app.get('/allProduct', async (req, res) => {
            const brand = req.query.brand;
            const query = { brand };
            const category = await ProductCollection.find(query).toArray();
            res.send(category);

        })
    }
    finally {

    }
}
run().catch(error => console.log(error))




app.listen(port, () => {
    console.log(`Resale market server side going on ${port}`)
})