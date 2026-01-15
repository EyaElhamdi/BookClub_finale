import mongoose from "mongoose";
// On utilise Mongoose pour définir le schéma et interagir avec MongoDB

// Définition du schéma pour le journal d'audit (Audit Log)
const auditSchema = new mongoose.Schema(
  {
    // L'utilisateur qui a effectué l'action (référence au modèle User)
    actor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },

    // Type d'action effectuée (ex : "CREATE_USER", "DELETE_POST", etc.)
    action: { 
      type: String, 
      required: true 
    },

    // Type de l'objet sur lequel l'action a été faite (ex : User, Post, Product)
    targetType: { 
      type: String 
    },

    // ID de l'objet cible de l'action
    targetId: { 
      type: mongoose.Schema.Types.ObjectId 
    },

    // Informations supplémentaires optionnelles (ex : valeurs avant/après)
    meta: { 
      type: Object 
    },
  },

  // timestamps: true ajoute automatiquement :
  // createdAt → date de création
  // updatedAt → date de dernière modification
  { timestamps: true }
);

// Export du modèle pour pouvoir l'utiliser dans le reste du projet
export default mongoose.model("AuditLog", auditSchema);
