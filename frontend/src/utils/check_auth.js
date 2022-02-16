export function is_loggedin () {
  if (!localStorage.getItem("user_token")) {
    return false
  } else {
    return true
  }
}

export function is_current_user (user_id) {
  if (localStorage.getItem("user_id") == user_id) return true
  return false
}
