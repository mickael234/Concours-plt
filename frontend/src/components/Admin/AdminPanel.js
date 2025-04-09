"use client"

// Fonction pour mettre à jour le rôle d'un utilisateur admin
const updateToSuperAdmin = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Assurez-vous d'avoir un token admin
      },
      body: JSON.stringify({ role: "superadmin" }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erreur lors de la mise à jour du rôle")
    }

    const data = await response.json()
    console.log("Rôle mis à jour avec succès:", data)
    alert("Rôle mis à jour avec succès!")
  } catch (error) {
    console.error("Erreur:", error)
    alert(`Erreur: ${error.message}`)
  }
}

// Pour utiliser cette fonction, par exemple avec un bouton:
;<button onClick={() => updateToSuperAdmin("677fa8b23f63696c25dd4d35")}>Promouvoir en Super Admin</button>

