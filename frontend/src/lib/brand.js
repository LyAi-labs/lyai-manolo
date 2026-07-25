// Recursos de marca compartidos (foto real del profe, etc.)
export const TEACHER_PHOTO = '/manolo.jpg'
export const TEACHER_AVATAR = '/manolo-avatar.jpg'

// ¿La cuenta logueada es Manolo (el profe con foto)? Otros admins (Ignacio)
// no llevan su foto: caen al avatar con inicial.
export const isManolo = (user) =>
  user?.username === 'manolo' || /(^|\s)manolo(\s|$)/i.test(user?.name || '')
