"use client"

import { useState, useEffect } from "react"
import { fetchUsers, createUser, updateUser, deleteUser } from "../../services/api"
import "./UserManager.css"

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", isAdmin: false })
  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({ name: "", email: "", isAdmin: false })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetchUsers()
      setUsers(response.data || response) // Handle both response formats
      setError(null)
    } catch (err) {
      setError("Error loading users: " + err.message)
      console.error("Error loading users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await createUser(newUser)
      setNewUser({ name: "", email: "", password: "", isAdmin: false })
      loadUsers()
    } catch (err) {
      setError("Error creating user: " + err.message)
      console.error("Error creating user:", err)
    }
  }

  const handleEditClick = (user) => {
    setEditingUser(user._id)
    setEditFormData({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
    })
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditFormData({ name: "", email: "", isAdmin: false })
  }

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      await updateUser(editingUser, editFormData)
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      setError("Error updating user: " + err.message)
      console.error("Error updating user:", err)
    }
  }

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id)
        loadUsers()
      } catch (err) {
        setError("Error deleting user: " + err.message)
        console.error("Error deleting user:", err)
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  if (loading) return <div className="loading">Loading users...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="user-manager">
      <h2>User Management</h2>

      <div className="create-user-form">
        <h3>Create New User</h3>
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              placeholder="Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input type="checkbox" name="isAdmin" checked={newUser.isAdmin} onChange={handleInputChange} />
              Is Admin
            </label>
          </div>

          <button type="submit" className="create-button">
            Create User
          </button>
        </form>
      </div>

      <div className="users-list">
        <h3>Liste des Utilisateurs</h3>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <>
            {/* Version desktop - tableau */}
            <div className="desktop-table">
              <table>
                <thead>
                  <tr>
                    <th>NOM</th>
                    <th>EMAIL</th>
                    <th>ADMIN</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      {editingUser === user._id ? (
                        // Edit form row
                        <>
                          <td colSpan="4">
                            <form onSubmit={handleUpdateUser} className="edit-form">
                              <div className="form-group">
                                <label htmlFor={`edit-name-${user._id}`}>Name</label>
                                <input
                                  type="text"
                                  id={`edit-name-${user._id}`}
                                  name="name"
                                  value={editFormData.name}
                                  onChange={handleEditFormChange}
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor={`edit-email-${user._id}`}>Email</label>
                                <input
                                  type="email"
                                  id={`edit-email-${user._id}`}
                                  name="email"
                                  value={editFormData.email}
                                  onChange={handleEditFormChange}
                                  required
                                />
                              </div>

                              <div className="form-group checkbox">
                                <label>
                                  <input
                                    type="checkbox"
                                    name="isAdmin"
                                    checked={editFormData.isAdmin}
                                    onChange={handleEditFormChange}
                                  />
                                  Is Admin
                                </label>
                              </div>

                              <div className="edit-actions">
                                <button type="submit" className="save-button">
                                  Save
                                </button>
                                <button type="button" onClick={handleCancelEdit} className="cancel-button">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </td>
                        </>
                      ) : (
                        // Normal display row
                        <>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.isAdmin ? "Yes" : "No"}</td>
                          <td className="action-buttons">
                            <button onClick={() => handleEditClick(user)} className="edit-button">
                              Modifier
                            </button>
                            <button onClick={() => handleDeleteUser(user._id)} className="delete-button">
                              Supprimer
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Version mobile - cartes */}
            <div className="mobile-cards">
              {users.map((user) => (
                <div key={user._id} className="user-card">
                  {editingUser === user._id ? (
                    // Formulaire d'édition mobile
                    <form onSubmit={handleUpdateUser} className="edit-form">
                      <div className="form-group">
                        <label htmlFor={`edit-name-mobile-${user._id}`}>Name</label>
                        <input
                          type="text"
                          id={`edit-name-mobile-${user._id}`}
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`edit-email-mobile-${user._id}`}>Email</label>
                        <input
                          type="email"
                          id={`edit-email-mobile-${user._id}`}
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditFormChange}
                          required
                        />
                      </div>

                      <div className="form-group checkbox">
                        <label>
                          <input
                            type="checkbox"
                            name="isAdmin"
                            checked={editFormData.isAdmin}
                            onChange={handleEditFormChange}
                          />
                          Is Admin
                        </label>
                      </div>

                      <div className="edit-actions">
                        <button type="submit" className="save-button">
                          Save
                        </button>
                        <button type="button" onClick={handleCancelEdit} className="cancel-button">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Affichage normal mobile
                    <>
                      <div className="user-card-header">
                        <div className="user-card-name">{user.name}</div>
                        {user.isAdmin && <div className="user-card-admin">Admin</div>}
                      </div>
                      <div className="user-card-email">{user.email}</div>
                      <div className="user-card-actions">
                        <button onClick={() => handleEditClick(user)} className="user-card-btn user-card-btn-edit">
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="user-card-btn user-card-btn-delete"
                        >
                          Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UserManager
