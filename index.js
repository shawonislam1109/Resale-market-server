const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
const express = require('express');
const cors = require('cors')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;


//  middleware 

app.use(cors())
app.use(express.json())

const user = process.env.BD_User
const password = process.env.BD_Password

function jwtVerify(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send('forbidden access')
        }
        req.decoded = decoded;
        next();
    })

}


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
        const OrderCollection = client.db('Resale-market').collection('OrderProduct')
        const UserCollection = client.db('Resale-market').collection('AllUser')


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
        app.get('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const SingleCategory = await ProductCollection.find(query).toArray();
            res.send(SingleCategory);
        })
        app.post('/orderProduct', async (req, res) => {
            const query = req.body;
            const orderProduct = await OrderCollection.insertOne(query);
            res.send(orderProduct)
        })
        app.get('/orderProducts', jwtVerify, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const deCodedEmail = req.decoded.email;
            if (deCodedEmail !== email) {
                return res.status(403).send('forbidden access')
            }
            const orders = await OrderCollection.find(query).toArray()
            res.send(orders);
        })
        app.delete('/orderProducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await OrderCollection.deleteOne(filter);
            res.send(result);
        })
        app.get('/allUsers', async (req, res) => {
            const query = {};
            const users = await UserCollection.find(query).toArray();
            res.send(users);
        })
        app.put('/allUsers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const UpdateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await UserCollection.updateOne(filter, UpdateDoc, option);
            res.send(result)
        })
        app.post('/allUser', async (req, res) => {
            const query = req.body;
            const user = await UserCollection.insertOne(query)
            res.send(user)
        })
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await UserCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '10h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: 'token' })
        })
        app.post('/allProducts', async (req, res) => {
            const query = req.body;
            const allProduct = await ProductCollection.insertOne(query);
            res.send(allProduct)
        })
        app.put('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    soled: 'sold'
                }
            }
            const result = await ProductCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(error => console.log(error))




app.listen(port, () => {
    console.log(`Resale market server side going on ${port}`)
})