import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { publicAddress, signature, orderId } = req.body;
    try {
      const result = await axios.post(`https://staging.ethdenver2023.zksync.dev/v1/tickets/${orderId}/claim`, {
        publicAddress,
        signature,
      });
      const data = await result.data;
      console.log(`n-🔴 => data`, data);

      res.status(200).json({ data });
    } catch (error: any) {
      if (error?.response) {
        console.log(`n-🔴 => error?.response?.data`, error?.response?.data);
        res.status(200).json({ error: error?.response?.data });
      }
    }
  } else {
    res.status(200).json({ error: "its post request" });
  }
}
