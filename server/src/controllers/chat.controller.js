import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { generateRagResponse } from '../services/ragService.js';

export const handleChat = async (req, res, next) => {
  try {
    const { messages, incidentContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new ApiError(400, 'Chat messages array is required');
    }

    // Call RAG Service
    const aiResponseText = await generateRagResponse(messages, incidentContext);

    return res.status(200).json(
      new ApiResponse(200, 'AI response generated', { text: aiResponseText })
    );
  } catch (error) {
    next(new ApiError(500, `Chat processing failed: ${error.message}`));
  }
};
