// MongoDB initialization script
const db = db.getSiblingDB("expense_management")

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password", "role", "department"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
          description: "must be a valid email and is required",
        },
        password: {
          bsonType: "string",
          minLength: 6,
          description: "must be a string with at least 6 characters and is required",
        },
        role: {
          enum: ["FUNCIONARIO", "GERENTE", "DIRETOR"],
          description: "must be one of the enum values and is required",
        },
        department: {
          bsonType: "string",
          description: "must be a string and is required",
        },
      },
    },
  },
})

db.createCollection("expenses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "amount", "category", "date", "submittedById"],
      properties: {
        title: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        description: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        amount: {
          bsonType: "number",
          minimum: 0,
          description: "must be a positive number and is required",
        },
        category: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        status: {
          enum: ["PENDING", "APPROVED", "REJECTED", "SIGNED"],
          description: "must be one of the enum values",
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date",
        },
      },
    },
  },
})

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.expenses.createIndex({ submittedById: 1 })
db.expenses.createIndex({ status: 1 })
db.expenses.createIndex({ createdAt: -1 })

print("Database initialized successfully!")
