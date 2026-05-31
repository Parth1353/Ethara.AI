export class ApiError extends Error {
  constructor(message, status = 400, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function getErrorMessage(error) {
  if (!error) {
    return ''
  }

  if (error instanceof ApiError) {
    return error.message
  }

  if (error.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
