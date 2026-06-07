package errors

import "fmt"

const (
	ErrBadRequest   = 400
	ErrNotFound     = 404
	ErrInternal     = 500
	ErrValidation   = 422
	ErrUnauthorized = 401
	ErrForbidden    = 403
)

type AppError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

func WrapError(err error, code int, message string) *AppError {
	if err == nil {
		return nil
	}
	return &AppError{
		Code:    code,
		Message: message,
		Details: err.Error(),
	}
}

func NewBadRequest(message string) *AppError {
	return NewAppError(ErrBadRequest, message)
}

func NewNotFound(message string) *AppError {
	return NewAppError(ErrNotFound, message)
}

func NewInternal(message string) *AppError {
	return NewAppError(ErrInternal, message)
}

func NewValidation(message string) *AppError {
	return NewAppError(ErrValidation, message)
}

func BadRequestf(format string, args ...interface{}) *AppError {
	return NewAppError(ErrBadRequest, fmt.Sprintf(format, args...))
}

func NotFoundf(format string, args ...interface{}) *AppError {
	return NewAppError(ErrNotFound, fmt.Sprintf(format, args...))
}

func Internalf(format string, args ...interface{}) *AppError {
	return NewAppError(ErrInternal, fmt.Sprintf(format, args...))
}

func Validationf(format string, args ...interface{}) *AppError {
	return NewAppError(ErrValidation, fmt.Sprintf(format, args...))
}
