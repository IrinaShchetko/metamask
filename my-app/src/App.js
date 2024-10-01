import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false); // Статус подключения
  const [inputValue, setInputValue] = useState(''); // Ввод значения для отправки

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = [
    { "inputs": [{ "internalType": "address", "name": "_storageContract", "type": "address" }], "stateMutability": "payable", "type": "constructor" },
    { "inputs": [], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "storageContract", "outputs": [{ "internalType": "contract IStorage", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address payable", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
  ];

  // Функция для инициализации Web3 и контракта
  const initWeb3 = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Инициализируем контракт
        const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
        setContract(contractInstance);

        // Если уже подключен кошелек
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error("Error initializing Web3:", error);
    }
  };

  // Функция для подключения кошелька и запуска MetaMask
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);

        // Запускаем окно MetaMask для подключения аккаунтов
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWeb3(web3Instance);

        // Инициализируем контракт
        const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
        setContract(contractInstance);

        // Устанавливаем аккаунт
        setAccount(accounts[0]);
        setIsConnected(true); // Устанавливаем статус подключения
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Функция для отправки значения в контракт
  const sendValueToContract = async (e) => {
    e.preventDefault();
    try {
      if (contract && web3 && account) {
        const valueInWei = web3.utils.toWei(inputValue, 'ether');
        await contract.methods.deposit(account, valueInWei).send({ from: account, value: valueInWei });
        alert('Значение успешно отправлено');
        setInputValue(''); // Очищаем поле ввода
      } else {
        alert('Кошелек не подключен');
      }
    } catch (error) {
      console.error("Ошибка отправки:", error);
    }
  };

  // Инициализируем Web3 при монтировании компонента
  useEffect(() => {
    initWeb3();
  }, []);

  return (
    <div className='App'>
      {account ? (
        <p className='mb-5 text-2xl'>Привет, {account.substring(0, 5)}</p>
      ) : (
        <p className='mb-5 text-5xl text-red-500'>юзер не подключен</p>
      )}

      {!isConnected ? (
        <button
          className='px-4 py-2 font-bold border border-orange-500 rounded cursor-pointer hover:bg-orange-400 active:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-300'
          onClick={connectWallet}
        >
          Подключи кошелек
        </button>
      ) : (
        <form onSubmit={sendValueToContract}>
          <input
            className='px-4 py-2 mr-3 border border-gray-800 rounded'
            type='number'
            placeholder='Введите сумму'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className='px-4 py-2 font-bold border border-black rounded cursor-pointer hover:bg-orange-400 active:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-300'
            type='submit'
          >
            Отправить значение
          </button>
        </form>
      )}
    </div>
  );
};

export default App;
