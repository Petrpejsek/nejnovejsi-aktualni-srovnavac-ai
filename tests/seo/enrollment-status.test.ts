import { readEnrollmentStatus } from '../../app/api/seo/enrollment-status/route'

test('enrollment status reflects env flag', () => {
  // @ts-ignore
  process.env.OAUTH_ENROLLMENT_ENABLED = 'true'
  expect(readEnrollmentStatus().enabled).toBe(true)
  // @ts-ignore
  process.env.OAUTH_ENROLLMENT_ENABLED = 'false'
  expect(readEnrollmentStatus().enabled).toBe(false)
})


