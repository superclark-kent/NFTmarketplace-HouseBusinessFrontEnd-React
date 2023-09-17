# NFT Marketplace - House Business Frontend (React)
A robust frontend interface for the NFT marketplace that emphasizes real estate and house businesses. Built leveraging React's component-based architecture, integrated with Web3 and the Ethereum blockchain.
![Screenshot_62](https://github.com/stuartgregorysharpe/NFTmarketplace-HouseBusinessFrontEnd-React/assets/137684294/8f9b649e-b982-4111-a630-3b9dac79fdd2)

# Here is Contract: https://github.com/stuartgregorysharpe/NFT.MarketPlace-HouseBusiness

# Table of Contents

Technologies Used

Directory Structure

Installation & Setup

API Integration

Contributing

License

# Technologies Used
React: For building the user interface components.

Redux: State management.

Web3.js: For Ethereum blockchain interaction.

IPFS: For decentralized storage of assets and metadata.

TailwindCSS/SCSS: Styling and layout.

# Directory Structure
📦NFTmarketplace-HouseBusinessFrontEnd-React

 ┣ 📂src
 
 ┃ ┣ 📂components

 ┃ ┣ 📂redux
 
 ┃ ┣ 📂services
 
 ┃ ┗ ...
 
 ┣ 📜.env
 
 ┣ 📜package.json
 
 ┗ ...

# Installation & Setup
Environment Variables: Copy .env.example to .env and adjust variables if necessary.

# Install Dependencies:

npm install

Blockchain Setup:

Ensure you have MetaMask or another wallet provider set up for local development. Configure it to connect to your local Ethereum testnet or a public testnet (e.g., Rinkeby).

# Run the Development Server:

npm run dev

This starts the webpack dev server on http://localhost:3000.

# API Integration
This frontend integrates with a backend through RESTful APIs. Refer to the services directory for API endpoints and their descriptions.

# Endpoints:

/api/nft: Fetch all NFT listings.

/api/nft/:id: Fetch a specific NFT by its ID.

(Add more endpoints and details if necessary)

# Contributing

Fork the repository and create your branch from main.

Install dependencies: npm install

Make sure your code passes linting: npm run lint

Push the branch and submit a pull request.

Please read our contribution guidelines for detailed steps.

# License

This project is licensed under the MIT License. See the LICENSE.md file for details.

