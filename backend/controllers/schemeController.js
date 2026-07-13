const Scheme = require('../models/Scheme');

// @desc    Get all schemes with filtering & searching
// @route   GET /api/schemes
// @access  Public
const getSchemes = async (req, res) => {
  const { category, search } = req.query;
  let query = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const schemes = await Scheme.find(query).sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single scheme details & increment views
// @route   GET /api/schemes/:id
// @access  Public
const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (scheme) {
      scheme.viewsCount += 1;
      await scheme.save();
      res.json(scheme);
    } else {
      res.status(404).json({ message: 'Welfare scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new scheme (Admin only)
// @route   POST /api/schemes
// @access  Private/Admin
const createScheme = async (req, res) => {
  const {
    title,
    description,
    category,
    eligibilityCriteria,
    requiredDocuments,
    formUrl,
    expiresAt
  } = req.body;

  try {
    const scheme = new Scheme({
      title,
      description,
      category,
      eligibilityCriteria: {
        minAge: eligibilityCriteria?.minAge || 0,
        maxAge: eligibilityCriteria?.maxAge || 150,
        maxIncome: eligibilityCriteria?.maxIncome || null,
        allowedOccupations: eligibilityCriteria?.allowedOccupations || [],
        allowedCategories: eligibilityCriteria?.allowedCategories || []
      },
      requiredDocuments: requiredDocuments || [],
      formUrl: formUrl || '',
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    const createdScheme = await scheme.save();
    res.status(201).json(createdScheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an existing scheme (Admin only)
// @route   PUT /api/schemes/:id
// @access  Private/Admin
const updateScheme = async (req, res) => {
  const {
    title,
    description,
    category,
    eligibilityCriteria,
    requiredDocuments,
    formUrl,
    expiresAt
  } = req.body;

  try {
    const scheme = await Scheme.findById(req.params.id);

    if (scheme) {
      scheme.title = title || scheme.title;
      scheme.description = description || scheme.description;
      scheme.category = category || scheme.category;
      
      if (eligibilityCriteria) {
        scheme.eligibilityCriteria = {
          minAge: eligibilityCriteria.minAge !== undefined ? eligibilityCriteria.minAge : scheme.eligibilityCriteria.minAge,
          maxAge: eligibilityCriteria.maxAge !== undefined ? eligibilityCriteria.maxAge : scheme.eligibilityCriteria.maxAge,
          maxIncome: eligibilityCriteria.maxIncome !== undefined ? eligibilityCriteria.maxIncome : scheme.eligibilityCriteria.maxIncome,
          allowedOccupations: eligibilityCriteria.allowedOccupations !== undefined ? eligibilityCriteria.allowedOccupations : scheme.eligibilityCriteria.allowedOccupations,
          allowedCategories: eligibilityCriteria.allowedCategories !== undefined ? eligibilityCriteria.allowedCategories : scheme.eligibilityCriteria.allowedCategories
        };
      }

      scheme.requiredDocuments = requiredDocuments || scheme.requiredDocuments;
      scheme.formUrl = formUrl !== undefined ? formUrl : scheme.formUrl;
      // Update expiresAt: allow setting to null (clear deadline) or a new date
      if (expiresAt !== undefined) {
        scheme.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }

      const updatedScheme = await scheme.save();
      res.json(updatedScheme);
    } else {
      res.status(404).json({ message: 'Welfare scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a scheme (Admin only)
// @route   DELETE /api/schemes/:id
// @access  Private/Admin
const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (scheme) {
      await scheme.deleteOne();
      res.json({ message: 'Welfare scheme deleted successfully' });
    } else {
      res.status(404).json({ message: 'Welfare scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment scheme downloads
// @route   POST /api/schemes/:id/download
// @access  Public
const incrementDownloads = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (scheme) {
      scheme.downloadsCount += 1;
      await scheme.save();
      res.json({ downloadsCount: scheme.downloadsCount });
    } else {
      res.status(404).json({ message: 'Welfare scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check eligibility for all schemes based on user inputs
// @route   POST /api/schemes/check-eligibility
// @access  Public
const checkEligibility = async (req, res) => {
  const { age, annualIncome, occupation, category } = req.body;

  try {
    const schemes = await Scheme.find({});
    
    const results = schemes.map(scheme => {
      const criteria = scheme.eligibilityCriteria;
      let isEligible = true;
      let reasons = [];

      // 1. Age check
      if (age !== undefined && age !== null && age !== '') {
        const userAge = Number(age);
        if (userAge < criteria.minAge) {
          isEligible = false;
          reasons.push(`Minimum age required is ${criteria.minAge} (You entered ${userAge})`);
        }
        if (criteria.maxAge && userAge > criteria.maxAge) {
          isEligible = false;
          reasons.push(`Maximum age limit is ${criteria.maxAge} (You entered ${userAge})`);
        }
      }

      // 2. Income check
      if (annualIncome !== undefined && annualIncome !== null && annualIncome !== '') {
        const userIncome = Number(annualIncome);
        if (criteria.maxIncome && userIncome > criteria.maxIncome) {
          isEligible = false;
          reasons.push(`Maximum annual income limit is ₹${criteria.maxIncome} (You entered ₹${userIncome})`);
        }
      }

      // 3. Occupation check
      if (occupation && criteria.allowedOccupations && criteria.allowedOccupations.length > 0) {
        // Normalize occupation checks (case-insensitive trim)
        const userOcc = occupation.trim().toLowerCase();
        const matchesOcc = criteria.allowedOccupations.some(
          occ => occ.trim().toLowerCase() === userOcc
        );
        if (!matchesOcc) {
          isEligible = false;
          reasons.push(`Eligible occupations: ${criteria.allowedOccupations.join(', ')}`);
        }
      }

      // 4. Category check
      if (category && criteria.allowedCategories && criteria.allowedCategories.length > 0) {
        const userCat = category.trim().toLowerCase();
        const matchesCat = criteria.allowedCategories.some(
          cat => cat.trim().toLowerCase() === userCat
        );
        if (!matchesCat) {
          isEligible = false;
          reasons.push(`Eligible categories: ${criteria.allowedCategories.join(', ')}`);
        }
      }

      return {
        scheme: {
          _id: scheme._id,
          title: scheme.title,
          category: scheme.category,
          description: scheme.description,
          formUrl: scheme.formUrl,
          expiresAt: scheme.expiresAt
        },
        isEligible,
        reasons
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  incrementDownloads,
  checkEligibility
};
