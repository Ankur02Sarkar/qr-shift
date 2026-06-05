export type Bindings = {
  DB: D1Database
}

export type Variables = {
  userId: string
}

export type HonoEnv = {
  Bindings: Bindings
  Variables: Variables
}
