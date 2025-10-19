import Contact from "../models/Contact.js";

// @desc    Get all contact messages with admin details
// @route   GET /api/admin/contacts
// @access  Private (Admin)
const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get all contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get single contact message
// @route   GET /api/admin/contacts/:id
// @access  Private (Admin)
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get contact by id error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/admin/contacts/:id
// @access  Private (Admin)
const updateContact = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (notes) contact.notes = notes;

    await contact.save();

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/admin/contacts/:id
// @access  Private (Admin)
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getAllContacts, getContactById, updateContact, deleteContact };
