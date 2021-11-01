# notes

notes ada di [notes.md](notes.md)

# dependencies

- browser with metamask installed
- ganache
- truffle
- react

# setup

1. `npm install`

# running

1. open ganache
   1. add truffle-config.js
   2. open browser
   3. connect metamask to ganache rpc server
   4. add an account from ganache to metamask
2. `truffle migrate`
3. open another terminal
4. `cd ./src/components`
5. `yarn start` / `npm start`
6. go to localhost:3000
7. get the ERC20 address from truffle or the webapp
   1. open metamask, import token, paste the ERC20 address

# credits

app scaffold: [designing a dbank smart contract](https://www.youtube.com/watch?v=xWFba_9QYmc&list=PLS5SEs8ZftgUNcUVXtn2KXiE1Ui9B5UrY&index=7)