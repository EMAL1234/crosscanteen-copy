const mongoClient=require('mongodb').MongoClient
const state={db:null}
module.exports.connect=function(done)
{
    const url='mongodb://localhost:27017'
    const dbname='products'
    mongoClient.connect(url,(error,data)=>
    {
        if(error) return done(error)
        state.db=data.db(dbname)

    })
    done()
}
module.exports.get=function()
{
    return state.db
}
