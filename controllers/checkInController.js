import CheckIn from "../models/CheckIn.js";

export const createCheckIn = async (req, res) => {
  try {
    const newEntry = new CheckIn(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
