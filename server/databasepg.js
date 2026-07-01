const {Client}=require('pg');
// import pkg from 'pg';
// const { Client } = pkg;
const client=new Client({
    host:'localhost',
    user:'postgres',
    post:5432,
    password:'1q2w3e4r5t6y',
    database:'postgres'
})
client.connect();
client.query(`select * from frist`,(err,res)=>{
    if(!err){
        console.log(res.rows);
    }else{
        console.log(err.message);
    }
    client.end();
})