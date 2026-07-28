import { gql } from '@apollo/client';

export const FULL_PROFILE_FIELDS = gql`
  fragment FullProfileFields on User {
    id
    name
    email
    role
    profilePicture
    isVerified
    bio
    skills
    hourlyRate
    availability
    resumeUrl
    portfolio {
      title
      url
      image
    }
    github
    linkedin
    website
    companyName
    companyLogo
    industry
    description
    contactNumber
  }
`;

export const ME_FULL_QUERY = gql`
  ${FULL_PROFILE_FIELDS}
  query MeFull {
    me {
      ...FullProfileFields
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  ${FULL_PROFILE_FIELDS}
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...FullProfileFields
    }
  }
`;

export const FREELANCERS_QUERY = gql`
  query Freelancers($search: String, $skills: [String!], $limit: Int, $offset: Int) {
    freelancers(search: $search, skills: $skills, limit: $limit, offset: $offset) {
      id
      name
      profilePicture
      bio
      skills
      hourlyRate
      availability
    }
  }
`;

export const USER_QUERY = gql`
  ${FULL_PROFILE_FIELDS}
  query UserProfile($id: ID!) {
    user(id: $id) {
      ...FullProfileFields
    }
  }
`;