const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const secret = "secret";

function getStartupCode(language) {
  if (language.toLowerCase() === "python") {
    return 'print("Hello World")';
  } else if (language.toLowerCase() === "java") {
    return 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }';
  } else if (language.toLowerCase() === "javascript") {
    return 'console.log("Hello World");';
  } else if (language.toLowerCase() === "cpp") {
    return '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
  } else if (language.toLowerCase() === "c") {
    return '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
  } else if (language.toLowerCase() === "go") {
    return 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}';
  } else if (language.toLowerCase() === "bash") {
    return 'echo "Hello World"';
  } else {
    return "Language not supported";
  }
}
exports.signUp = async (req, res) => {
  try {
    let { email, pwd, fullName } = req.body;

    let emailCon = await userModel.findOne({ email: email });
    if (emailCon) {
      return res.status(400).json({
        success: false,
        msg: "Email already exist",
      });
    }

    bcrypt.genSalt(12, function (err, salt) {
      bcrypt.hash(pwd, salt, async function (err, hash) {
        let user = await userModel.create({
          email: email,
          password: hash,
          fullName: fullName,
        });

        return res.status(200).json({
          success: true,
          msg: "User created successfully",
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, pwd } = req.body;

    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    bcrypt.compare(pwd, user.password, function (err, result) {
      if (result) {
        let token = jwt.sign({ userId: user._id }, secret);

        return res.status(200).json({
          success: true,
          msg: "User logged in successfully",
          token,
        });
      } else {
        return res.status(401).json({
          success: false,
          msg: "Invalid password",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.createProj = async (req, res) => {
  try {
    let { name, projLanguage, token, version } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    let project = await projectModel.create({
      name: name,
      projLanguage: projLanguage,
      createdBy: user._id,
      code: getStartupCode(projLanguage),
      version: version,
    });

    return res.status(200).json({
      success: true,
      msg: "Project created successfully",
      projectId: project._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.saveProject = async (req, res) => {
  try {
    let { token, projectId, code } = req.body;
    console.log("DATA: ", token, projectId, code);
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    let project = await projectModel.findOneAndUpdate(
      { _id: projectId },
      { code: code }
    );

    return res.status(200).json({
      success: true,
      msg: "Project saved successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let { token } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    let projects = await projectModel.find({ createdBy: user._id });

    return res.status(200).json({
      success: true,
      msg: "Projects fetched successfully",
      projects: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.getProject = async (req, res) => {
  try {
    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    let project = await projectModel.findOne({ _id: projectId });

    if (project) {
      return res.status(200).json({
        success: true,
        msg: "Project fetched successfully",
        project: project,
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "Project not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    let project = await projectModel.findOneAndDelete({ _id: projectId });

    return res.status(200).json({
      success: true,
      msg: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

exports.editProject = async (req, res) => {
  try {
    let { token, projectId, name } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    let project = await projectModel.findOne({ _id: projectId });
    if (project) {
      project.name = name;
      await project.save();
      return res.status(200).json({
        success: true,
        msg: "Project edited successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "Project not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// AI Analysis Controller
exports.askAI = async (req, res) => {
  try {
    const { code, question, language, projectId } = req.body;

    // Use environment variable API key, fallback to request body
    const apiKey = process.env.ANTHROPIC_API_KEY || req.body.apiKey;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        msg: "Anthropic API key not configured. Please contact administrator.",
      });
    }

    if (!code && !question) {
      return res.status(400).json({
        success: false,
        msg: "Either code or question is required",
      });
    }

    // If projectId is provided, get language from database
    let detectedLanguage = language;
    if (projectId && !detectedLanguage) {
      try {
        const project = await projectModel.findById(projectId);
        if (project) {
          detectedLanguage = project.projLanguage;
        }
      } catch (err) {
        console.log("Could not fetch project language:", err.message);
      }
    }

    // Import Anthropic SDK
    const Anthropic = require("@anthropic-ai/sdk");

    // Initialize Anthropic client with API key
    const anthropic = new Anthropic({
      apiKey: apiKey.trim(),
    });

    // Construct the prompt for Claude
    let prompt = "";
    if (code && question) {
      prompt = `🔍 **Code Analysis Request**

I have this ${detectedLanguage || "code"} code:

\`\`\`${detectedLanguage || ""}
${code}
\`\`\`

**My Question:** ${question}

Please provide a comprehensive analysis addressing my specific question. Structure your response as follows:

## 📋 Quick Summary
- Brief overview of what this code does

## 💭 Answer to Your Question
- Direct, detailed answer to: "${question}"

## 🔧 Code Improvements
- Specific suggestions for better implementation
- Alternative approaches if applicable

## ⚠️ Potential Issues
- Any bugs, edge cases, or problems you notice

## 🚀 Performance & Best Practices
- Optimization opportunities
- Modern ${detectedLanguage || "programming"} best practices

Be specific, actionable, and provide code examples where helpful.`;
    } else if (code) {
      prompt = `🔍 **Comprehensive Code Analysis**

Please analyze this ${detectedLanguage || "code"} code:

\`\`\`${detectedLanguage || ""}
${code}
\`\`\`

## 📋 Code Overview
- What does this code do?
- Main purpose and functionality

## ✅ Code Quality Assessment
- Overall code quality rating (1-10)
- Readability and maintainability

## 🐛 Bug Detection & Issues
- Potential bugs or logical errors
- Edge cases that might cause problems
- Type safety issues (if applicable)

## 🚀 Performance Analysis
- Current performance characteristics
- Optimization opportunities
- Big O complexity (if applicable)

## 🛡️ Security Considerations
- Security vulnerabilities or concerns
- Input validation issues
- Best practices for secure coding

## 💡 Improvement Suggestions
- Specific code improvements with examples
- Modern ${detectedLanguage || "programming"} features to consider
- Better algorithms or data structures

## 🎯 Best Practices
- ${detectedLanguage || "Programming"} conventions and standards
- Code organization suggestions
- Documentation recommendations

Please be specific and provide code examples where helpful. Focus on actionable insights that will make this code better.`;
    } else {
      prompt = `🤖 **AI Programming Assistant**

**Your Question:** ${question}

Please provide a comprehensive, well-structured answer that includes:

## 💭 Direct Answer
- Clear, direct response to your question

## 💡 Additional Insights
- Related concepts and considerations
- Best practices and recommendations

## 📚 Examples
- Code examples or practical demonstrations (if applicable)

## 🔗 Related Topics
- Connected concepts you might find useful

Please be thorough, educational, and provide practical value.`;
    }

    console.log("Sending request to Claude API...");

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the response text
    const aiResponse = message.content[0]?.text || "No response generated";

    console.log("Claude API response received successfully");

    return res.status(200).json({
      success: true,
      response: aiResponse,
      msg: "AI analysis completed successfully",
    });
  } catch (error) {
    console.error("AI API Error:", error);

    // Handle specific Anthropic API errors
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        msg: "Invalid API key. Please check your Anthropic API key configuration.",
      });
    } else if (error.status === 429) {
      return res.status(429).json({
        success: false,
        msg: "Rate limit exceeded. Please try again later.",
      });
    } else if (error.status === 400) {
      return res.status(400).json({
        success: false,
        msg: "Invalid request format. Please check your input.",
      });
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        msg: "Cannot connect to AI service. Please check your internet connection.",
      });
    } else {
      return res.status(500).json({
        success: false,
        msg: `AI service error: ${error.message || "Unknown error occurred"}`,
      });
    }
  }
};
