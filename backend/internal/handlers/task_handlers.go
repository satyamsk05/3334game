package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"bitarcade-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetTasks returns active tasks and user progress
func (h *APIHandler) GetTasks(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		// Try query param if coming from webview
		userID = c.Query("userId")
	}

	data, err := h.taskService.GetTasks(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// ClaimDailyCheckin claims today's consecutive checkin reward
func (h *APIHandler) ClaimDailyCheckin(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User authentication required",
		})
		return
	}

	rewardRupees, err := h.taskService.ClaimDailyCheckin(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Congratulations! Claimed ₹%.2f bonus cash.", rewardRupees),
		"data": gin.H{
			"rewardRupees": rewardRupees,
		},
	})
}

// ClaimMission claims a gameplay mission reward
func (h *APIHandler) ClaimMission(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User authentication required",
		})
		return
	}

	var req struct {
		TaskID string `json:"taskId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Task ID is required",
		})
		return
	}

	rewardRupees, err := h.taskService.ClaimMission(userID, req.TaskID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Mission completed! Claimed ₹%.2f bonus cash.", rewardRupees),
		"data": gin.H{
			"rewardRupees": rewardRupees,
		},
	})
}

// Admin: List all tasks
func (h *APIHandler) AdminGetTasks(c *gin.Context) {
	tasks, err := h.taskService.AdminListTasks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": tasks})
}

// Admin: Create or update task
func (h *APIHandler) AdminSaveTask(c *gin.Context) {
	var task models.TaskMission
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid task payload"})
		return
	}

	if err := h.taskService.AdminSaveTask(&task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Task saved successfully", "data": task})
}

// Admin: Delete task
func (h *APIHandler) AdminDeleteTask(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "ID is required"})
		return
	}

	if err := h.taskService.AdminDeleteTask(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Task deleted successfully"})
}

// ServeTaskPage dynamically serves task-page/index.html to the app WebView
func (h *APIHandler) ServeTaskPage(c *gin.Context) {
	candidates := []string{
		"task-page/index.html",
		"../task-page/index.html",
		"../../task-page/index.html",
	}
	if exePath, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exePath)
		candidates = append(candidates,
			filepath.Join(exeDir, "task-page/index.html"),
			filepath.Join(exeDir, "../task-page/index.html"),
		)
	}
	for _, path := range candidates {
		if _, err := os.Stat(path); err == nil {
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
			c.Header("Pragma", "no-cache")
			c.Header("Expires", "0")
			c.File(path)
			return
		}
	}
	c.String(http.StatusNotFound, "Task page UI not found on server")
}
