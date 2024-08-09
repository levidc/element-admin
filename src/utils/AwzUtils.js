const isArrValSame = (arr1, arr2) => {
  arr1 = arr1 || []
  arr2 = arr2 || []
  if (arr1.length != arr2.length) return false
  const arr = [...(new Set([...arr1, ...arr2]))]
  return arr.length == arr1.length
}

export const findGroupFromPermissions = (statement, groups) => {
  return (groups || [])
    .find(pg => isArrValSame(pg.permissions.split(','), statement.Action) && (pg.allow ? 'Allow' : 'Deny') == statement.Effect)
}

export const formatViewStatement = (statement, groups) => {
  const gp = findGroupFromPermissions(statement, groups)
  if (gp) {
    statement.group = { id: gp.id, name: gp.name }
  }
  return statement
}
