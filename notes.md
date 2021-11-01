# gdp test
## kevin

### starting point (notes from gmeet)

DApp University
[designing a dbank smart contract](https://www.youtube.com/watch?v=xWFba_9QYmc&list=PLS5SEs8ZftgUNcUVXtn2KXiE1Ui9B5UrY&index=7) \
EatTheblocks \
Token in Crypto? \
How to create a token \
How Token Works \
ERC-20 Token \
Experiment: Decentralized Bank/NFT Minter/Decentralized Exchange \
ERC-721 (NFT)

### most used resources

setelah ngikutin tutorial smart contract dbank dari dapp university, bnyk yg belom di tangkep jadi googling:
- what is ethereum
- what is a smart contract
- what is a dapp
- dapp vs smart contract
- what is smart contract deployment
- what is gas
- how to save gas in smart contract code
- dll

resources yg selalu open in a tab
- [ethereum docs](https://ethereum.org/en/developers/docs/)
  - baca dari overview sampai smart contracts
  - buat mengerti fundamentals
- [eth.build yt playlist](https://www.youtube.com/playlist?list=PLJz1HruEnenCXH7KW7wBCEBnBLOVkiqIi)
  - menjelaskan fundamentals juga, nonton mulai dari hash function sampai smart contracts
  - jelasinnya sangat mudah dimengerti

### dapp

dapp adalah app yang dibuat dgn suatu "contract language" spt solidity, karena akan running on a blockchain, maka harus di deploy

maksudnya di deploy adalah
- smart contract dianggap seperti external accounts (account user biasa), bisa mempunyai balance eth juga
- tapi smart contract tdk bisa menginisiasi sebuah transaction di blockchain, hanya external acc yg bisa (walaupun smart contract bisa panggil function contract lain, semuanya tetap dimulai oleh user)
- karena app ini decentralized, app ini harus jalan di semua node dalam eth network, menghasilkan state baru dalam EVM, state ini menjadi subjek untuk consensus, setelah itu baru jadi transaction yg dimasukin di block terus nanti di mine
- karena hal ini juga, scalability problems muncul, tapi tampaknya eth2.0 akan membuat improvements disini
- karena harus bayar gas kalo mau deploy, kita pake development blockchain yaitu ganache
- smart contract yg di deploy di blockchain mirip dgn API yg di deploy di centralized server, masih butuh frontend

tapi frontend nya harus bisa berkomunikasi dgn JSON-RPC, browser sekarang biasa tdk bisa jadi butuh extension, umumnya metamask
- dgn metamask kita dapat akses ke berbagai web3 functions
- dengan ini kita bisa berinteraksi dgn smart contracts (panggil functions)

kalo gitu dapp bisa dipake buat bnyk hal dong? ternyata bener, dbank bukanlah satu-satunya dapp, sdikit googling ternyata banyak juga dapp berupa game, jadi muncul bnyk ide kayak pokemon / yugioh based on NFT heheh

### solidity

setelah nnton dbank tutorial, rasanya gatel gara2 ga ngerti solidity, baca2 eth docs ketemu bagian **solidity learning resources** -> [cryptozombies](https://cryptozombies.io/)

belajar solidity di cryptozombies, selesai chapter-chapter basic solidity sampai web3js, baru make sense codingan yg ada di tutorial dapp university

ternyata ada challenge khusus dalam develping di blockchain, write ke storage sangat mahal karena state tersebut disimpan di EVM, dan setiap node di eth network menyimpan state EVM ini, dengan ini, kita jadi harus hati2, kadang lebih bagus membuat function read dengan O(n) dibanding O(log n) ataupun O(1) karena yg utama adalah irit storage, jadi kita sacrifice kecepatan read functions, tapi kalau smart contract kita sendiri menggunakan read functions ini secara internal maka kita juga dikenakan biaya gas, dilemma

sisanya, solidity cukup mirip bhs2 pemrograman yg sudah dipelajari, yg paling notable dalam segi teknikal adalah custom modifiers yang bisa ditumpuk2 mirip chain of responsibility, dan payable functions

### smart contract dev

gatel setelah belajar solidity, mau nyoba sendiri

- dbank sudah ada func `deposit` dan `withdraw`
- users juga akan menerima interest dalam bentuk token ERC20 buatan kita sendiri
- ERC20 kita in this case yaitu Decentralized Bank Token yg bertindak sbg currency
- terlalu pelan kalo mau ERC20 kita, user harus nunggu interest dari `deposit`, jadi saya tambah func `exchange` untuk tuker antara eth <=> token kita
  - karena skrg kita bakal punya eth, saya implement juga fungsi utk transfer bank eth balance ke owner

pengen nyoba implement sebuah NFT, saya bikin dapp untuk mengoleksi tanah
- seorang dapat mengclaim tanah di (x, y) arbitrary dengan membayar kita sejumlah eth
- jika tanah tsb belum punya pemilik, harga ditentukan pembeli
- jika tanah sudah dimiliki orang, pembeli dapat membayar lebih mahal dari harga original untuk mengambil paksa tanah tsb
  - setelah itu pemilik sebelumnya akan dikembalikan eth nya, namun kita potong sedikit untuk profit huehuehueheuh
- implementasi web3js utk display data dari smart contract func return value
- kedepannya bisa implementasi penggunaan ERC20 dari dapp dbank kita untuk digunakan sbg currency di dapp ini (instead of eth), jadi ceritanya kalau mau beli tanah disini, harus pake currency kita

dalam frontend sering terkena "VM exception invalid opcode" yang sangat sulit di debug karena basically tidak ada stack trace, jadi pengen mencoba build dapp from scratch supaya makin mengerti lagi sehingga bisa debug lebih baik

### smart contract security

walaupun security di bangga2kan di eth, tetap ada security problems, ada beberapa attack yg mencolok, seperti 

ada yg menyerang cream finance dgn mengeksploitasi fitur flash loan, which is a smart contract exclusive concept, udah sebegitu sophisticated yah waw

ada jg attack yg lebih technical yaitu reentrance attack

ada jg yg lebih basic seperti visibility modifiers yg salah
