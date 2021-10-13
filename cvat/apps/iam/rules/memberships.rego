package memberships
import data.utils
import data.organizations

# input: {
#     "scope": <"list"|"update"|"view"|"delete"> or null,
#     "auth": {
#         "user": {
#             "id": <num>,
#             "privilege": <"admin"|"business"|"user"|"worker"> or null
#         },
#         "organization": {
#             "id": <num>,
#             "owner": {
#                 "id": <num>
#             },
#             "user": {
#                 "role": <"owner"|"maintainer"|"supervisor"|"worker"> or null
#             }
#         } or null,
#     },
#     "resource": {
#         "role": <"owner"|"maintainer"|"supervisor"|"worker">,
#         "user": {
#             "id": <num>
#         }
#     }
# }

default allow = false
allow {
    utils.is_admin
}

allow {
    { utils.LIST, utils.VIEW }[input.scope]
    input.auth.organization.owner.id == input.auth.user.id
}

allow {
    { utils.LIST, utils.VIEW }[input.scope]
    input.auth.organization.role != null
}

allow {
    { utils.CHANGE_ROLE, utils.DELETE }[input.scope]
    input.auth.organization.owner.id == input.auth.user.id
}

allow {
    { utils.CHANGE_ROLE, utils.DELETE }[input.scope]
    input.resource.role != organizations.MAINTAINER
    input.auth.organization.role == organizations.MAINTAINER
}

filter = [] { # Django Q object to filter list of entries
    utils.is_admin
} else = [] {
    organizations.is_owner
} else = [] {
    organizations.is_member
} else = qobject {
    user := input.auth.user
    qobject := [ {"user_id": user.id} ]
}
