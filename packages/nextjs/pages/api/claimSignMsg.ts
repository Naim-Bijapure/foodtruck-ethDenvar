import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { orderId } = req.body;
      const result = await axios.get(`https://staging.ethdenver2023.zksync.dev/v1/tickets/${orderId}/message`);
      const data = await result.data;
      console.log(`n-🔴 => data`, data);

      res.status(200).json({ data });
    } catch (error: any) {
      if (error?.response) {
        console.log(`n-🔴 => error?.response?.data`, error?.response?.data);
        res.status(200).json({ error: error?.response?.data });
      }
    }
  }
}
