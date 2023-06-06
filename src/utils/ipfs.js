import { create as ipfsHttpClient } from 'ipfs-http-client';
import dotenv from "dotenv";
dotenv.config();

const projectId = process.env.REACT_APP_INFURA_API_ENDPOINT;
const projectSecret = process.env.REACT_APP_INFURA_API_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const FileUpload = async (file) => {
  const client = await ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  const UploadtoIPFS = async (file) => {
    const subdomain = 'https://offero.infura-ipfs.io';
    try {
      const added = await client.add({ content: file });
      const URL = `${subdomain}/ipfs/${added.path}`;
      return URL;
    } catch (error) {
      console.log('Error uploading file to IPFS.', error);
    }
  };

  const result = await UploadtoIPFS(file);
  return result;
};

export default FileUpload;