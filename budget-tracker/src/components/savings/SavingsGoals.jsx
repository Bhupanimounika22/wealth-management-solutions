'use client'

import { getAuth } from 'firebase/auth'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function SavingsGoals() {
  const auth = getAuth()
  const [showNewGoalForm, setShowNewGoalForm] = useState(false)
  const [goals, setGoals] = useState([])
  const [goalData, setGoalData] = useState({
    name: '',
    target: 0,
    current: 0,
    deadline: '',
  })
  const [editGoalId, setEditGoalId] = useState(null)

  const fetchGoals = useCallback(async () => {
    const user = auth.currentUser
    if (!user) {
      alert("Authentication Error: No user available")
      return
    }

    const idToken = await user.getIdToken()
    try {
      const response = await fetch(`http://localhost:5100/goals/${user.uid}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${idToken}` }
      })
      const data = await response.json()
      setGoals(data)
    } catch (error) {
      alert("Error: Failed to fetch goals")
    }
  }, [auth])

  useEffect(() => {
    if (auth.currentUser) {
      fetchGoals()
    }
  }, [auth, fetchGoals])

  const createGoal = async (event) => {
    event.preventDefault()
    const user = auth.currentUser
    if (!user) {
      alert("Authentication Error: No user available")
      return
    }

    const idToken = await user.getIdToken()
    try {
      const response = await fetch(`http://localhost:5100/goals/${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify(goalData)
      })
      const result = await response.json()
      setGoals([...goals, { ...goalData, id: result.goalId }])
      setShowNewGoalForm(false)
      setGoalData({ name: '', target: 0, current: 0, deadline: '' })
      alert("Success: Goal created successfully")
    } catch (error) {
      alert("Error: Failed to create goal")
    }
  }

  const updateGoal = async (event, goalId) => {
    event.preventDefault()
    const user = auth.currentUser
    if (!user) {
      alert("Authentication Error: No user available")
      return
    }

    const idToken = await user.getIdToken()
    try {
      await fetch(`http://localhost:5100/goals/${user.uid}/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify(goalData)
      })
      setGoals(goals.map(goal => (goal.id === goalId ? { ...goal, ...goalData } : goal)))
      setEditGoalId(null)
      alert("Success: Goal updated successfully")
    } catch (error) {
      alert("Error: Failed to update goal")
    }
  }

  const deleteGoal = async (goalId) => {
    const user = auth.currentUser
    if (!user) {
      alert("Authentication Error: No user available")
      return
    }

    const idToken = await user.getIdToken()
    try {
      await fetch(`http://localhost:5100/goals/${user.uid}/${goalId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` }
      })
      setGoals(goals.filter(goal => goal.id !== goalId))
      alert("Success: Goal deleted successfully")
    } catch (error) {
      alert("Error: Failed to delete goal")
    }
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between mb-4">
        <h2 className="h3">Savings Goals</h2>
        <button className="btn btn-primary" onClick={() => setShowNewGoalForm(!showNewGoalForm)}>
          <Plus className="me-2" /> New Goal
        </button>
      </div>

      {showNewGoalForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Create New Goal</h5>
          </div>
          <div className="card-body">
            <form onSubmit={createGoal}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="goalName" className="form-label">Goal Name</label>
                  <input
                    type="text"
                    id="goalName"
                    className="form-control"
                    value={goalData.name}
                    onChange={(e) => setGoalData({ ...goalData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="goalTarget" className="form-label">Target Amount</label>
                  <input
                    type="number"
                    id="goalTarget"
                    className="form-control"
                    value={goalData.target}
                    onChange={(e) => setGoalData({ ...goalData, target: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="goalDeadline" className="form-label">Deadline</label>
                  <input
                    type="date"
                    id="goalDeadline"
                    className="form-control"
                    value={goalData.deadline}
                    onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="goalCurrent" className="form-label">Initial Deposit</label>
                  <input
                    type="number"
                    id="goalCurrent"
                    className="form-control"
                    value={goalData.current}
                    onChange={(e) => setGoalData({ ...goalData, current: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-success me-2">Create Goal</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNewGoalForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {goals.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {goals.map((goal) => (
            <div className="col" key={goal.id}>
              <div className="card">
                <div className="card-header">
                  <h5>{goal.name}</h5>
                </div>
                <div className="card-body">
                  {editGoalId === goal.id ? (
                    <form onSubmit={(e) => updateGoal(e, goal.id)}>
                      <div className="mb-3">
                        <label htmlFor="goalName" className="form-label">Goal Name</label>
                        <input
                          type="text"
                          id="goalName"
                          className="form-control"
                          value={goalData.name}
                          onChange={(e) => setGoalData({ ...goalData, name: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="goalTarget" className="form-label">Target Amount</label>
                        <input
                          type="number"
                          id="goalTarget"
                          className="form-control"
                          value={goalData.target}
                          onChange={(e) => setGoalData({ ...goalData, target: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="goalDeadline" className="form-label">Deadline</label>
                        <input
                          type="date"
                          id="goalDeadline"
                          className="form-control"
                          value={goalData.deadline}
                          onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="goalCurrent" className="form-label">Initial Deposit</label>
                        <input
                          type="number"
                          id="goalCurrent"
                          className="form-control"
                          value={goalData.current}
                          onChange={(e) => setGoalData({ ...goalData, current: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-success me-2">Update Goal</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setEditGoalId(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p><strong>Target Amount:</strong> {goal.target}</p>
                      <p><strong>Current Savings:</strong> {goal.current}</p>
                      <p><strong>Deadline:</strong> {goal.deadline}</p>
                      <div className="d-flex justify-content-end">
                        <button className="btn btn-warning me-2" onClick={() => { setEditGoalId(goal.id); setGoalData(goal) }}>
                          <Edit2 size={16} /> Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteGoal(goal.id)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No goals found</p>
      )}
    </div>
  )
}
