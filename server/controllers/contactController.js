import Contact from "../models/Contact.js";

// @desc    Create contact submission
// @route   POST /api/contact
// @access  Public
export const createContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    };

    const contact = await Contact.create(contactData);

    res.status(201).json({
      success: true,
      message:
        "Your message has been sent successfully. We will get back to you soon.",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
      },
    });
  } catch (error) {
    console.error("Create contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error sending message",
    });
  }
};
