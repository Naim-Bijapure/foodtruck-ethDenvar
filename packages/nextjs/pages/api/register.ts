import axios from "axios";

export default async function handler(req, res) {
  // const result = await axios.get("https://staging.ethdenver2023.zksync.dev/v1/tickets/VMALNIO3BVDDE/message");
  // const data = await result.data;
  // console.log(`n-🔴 => data`, data);

  const token = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";

  try {
    const result = await axios.post(`https://staging.ethdenver2023.zksync.dev/v1/registrationEvent?token=${token}`, {
      name: "Naim",
      lastName: "Yo",
      email: "naim@gmail.com",
      orderID: "1J3D9L4C88K82",
      walletAddress: "0x0fAb64624733a7020D332203568754EB1a37DB89",
      scanTimestamp: "2023-01-18T19:11:04.078Z",
      access: "granted",
      attempt: 0,
      previousAttemptTimestamp: "2023-01-18T17:51:30.344Z",
    });
    const data = result.data;

    res.status(200).json({ data });
  } catch (error: any) {
    if (error?.response) {
      console.log(`n-🔴 => error?.response?.data`, error?.response?.data);
      res.status(200).json({ error: error?.response?.data });
    }
  }
}
