var player;
var pls = [];
var ptime = performance.now();
var global_speed = 2;
var object_box;
var frame = 0;
var debug_collisions = false;
var moveMode = document.getElementById("moveModeImage")

function initGame() {
  // Initialize your game here, e.g., create a new Box2D world
  world = new b2.b2World(new b2.b2Vec2(0, 20)); // Gravity is 10 m/s² downwards

  document.addEventListener('keydown', function (event) {
    controller._key_down(event);
  });
  document.addEventListener('keyup', function (event) {
    controller._key_up(event);
  });
  world.SetContactListener(new ContactListener());

  player = new Player(640, 500, 30, 30);
  loadPlatforms("eyJwIjpbImV5SjRJam8wTVRZdU1EQXdNREF6T0RFME5qazNNamNzSW5raU9qUXhOaTR3TURBd01ETTRNVFEyT1RjeU55d2lkeUk2TnpVeUxDSm9Jam8zT0RRc0ltWnBiR3hEYjJ4dmNpSTZJaU5qTTJJeE9USWlMQ0p6SWpvaUl6QXdNREF3TUNJc0luUWlPakVzSW5Saklqb2lJMlV3WkRRNVlTSXNJbU1pT21aaGJITmxmUT09IiwiZXlKNElqb3hPRFEzTGprNU9UazFOREl5TXpZek1qZ3NJbmtpT2prMU1pNHdNREF3TURjMk1qa3pPVFExTENKM0lqb3pOalkwTENKb0lqb3hPRGN5TENKbWFXeHNRMjlzYjNJaU9pSWpaREZrT1dVd0lpd2ljeUk2SWlNd01EQXdNREFpTENKMElqb3RNU3dpZEdNaU9pSWpNREF3TURBd0lpd2lZeUk2Wm1Gc2MyVjkiLCJleUo0SWpveE1EY3lMakF3TURBd056WXlPVE01TkRVc0lua2lPall5TXk0NU9UazVOemN4TVRFNE1UWTBMQ0ozSWpveU9EZ3NJbWdpT2pNeUxDSm1hV3hzUTI5c2IzSWlPaUlqT1RVMk5UWTFJaXdpY3lJNklpTTJZalppTm1JaUxDSjBJam96TENKMFl5STZJaU0xTURNME16UWlMQ0pqSWpwbVlXeHpaWDA9IiwiZXlKNElqb3hNRGN5TGpBd01EQXdOell5T1RNNU5EVXNJbmtpT2pjeU1Dd2lkeUk2TWpnNExDSm9Jam94TmpBc0ltWnBiR3hEYjJ4dmNpSTZJaU5rWW1FNVlUa2lMQ0p6SWpvaUl6VTBOVFExTkNJc0luUWlPakFzSW5Saklqb2lJMkV3Tm1FMllTSXNJbU1pT21aaGJITmxmUT09IiwiZXlKNElqb3hNRGN5TGpBd01EQXdOell5T1RNNU5EVXNJbmtpT2pjMU1pNHdNREF3TWpZM01ESTRPREE1TENKM0lqbzJOQ3dpYUNJNk9UWXNJbVpwYkd4RGIyeHZjaUk2SWlNeFlURmhNV0VpTENKeklqb2lJelpqTTJRelpDSXNJblFpT2pRc0luUmpJam9pSXpOa00yUXpaQ0lzSW1NaU9tWmhiSE5sZlE9PSIsImV5SjRJam94TURnd0xDSjVJam81TVRrdU9UazVPVGd3T1RJMk5URXpOeXdpZHlJNk5qVTJMQ0pvSWpveE1USXNJbVpwYkd4RGIyeHZjaUk2SWlNNVpEWTFOR1FpTENKeklqb2lJelJpTXpJd055SXNJblFpT2pVc0luUmpJam9pSTJJNE9XVTRPU0lzSW1NaU9uUnlkV1Y5IiwiZXlKNElqb3pNaTR3TURBd01ERTJOamc1TXpBd05UUXNJbmtpT2pRME9DNHdNREF3TURFNU1EY3pORGcyTXl3aWR5STZNeklzSW1naU9qY3lNQ3dpWm1sc2JFTnZiRzl5SWpvaUkyVXlPRFV3TnlJc0luTWlPaUlqTURBd01EQXdJaXdpZENJNkxURXNJblJqSWpvaUl6QXdNREF3TUNJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam95TnpFdU9UazVPVGs0TURreU5qVXhNemNzSW5raU9qZ3pNaTR3TURBd01EYzJNamt6T1RRMUxDSjNJam96TWl3aWFDSTZNVFl3TENKbWFXeHNRMjlzYjNJaU9pSWpNMk5rT0dJMklpd2ljeUk2SWlNd01EQXdNREFpTENKMElqb3RNU3dpZEdNaU9pSWpNREF3TURBd0lpd2lZeUk2ZEhKMVpYMD0iLCJleUo0SWpvek5USXVNREF3TURBM05qSTVNemswTlRNc0lua2lPamd4Tmk0d01EQXdNakk0T0RneE9ETTJMQ0ozSWpvME9Dd2lhQ0k2TVRFeUxDSm1hV3hzUTI5c2IzSWlPaUlqTWpJM1pUTmlJaXdpY3lJNklpTXdNREF3TURBaUxDSjBJam90TVN3aWRHTWlPaUlqTURBd01EQXdJaXdpWXlJNmRISjFaWDA9IiwiZXlKNElqb3hORFF1TURBd01EQTFOekl5TURRMU9Td2llU0k2TnpnekxqazVPVGs1TmpFNE5UTXdNamNzSW5jaU9qRXlPQ3dpYUNJNk1qUXdMQ0ptYVd4c1EyOXNiM0lpT2lJall6RXhNRFZsSWl3aWN5STZJaU13TURBd01EQWlMQ0owSWpvdE1Td2lkR01pT2lJak1EQXdNREF3SWl3aVl5STZkSEoxWlgwPSIsImV5SjRJam8xTnpZdU1EQXdNREl5T0RnNE1UZ3pOaXdpZVNJNk5ERTJMakF3TURBd016Z3hORFk1TnpJM0xDSjNJam96TWl3aWFDSTZOVFEwTENKbWFXeHNRMjlzYjNJaU9pSWpSRVF4TVRJeUlpd2ljeUk2SWlNd01EQXdNREFpTENKMElqb3RNU3dpZEdNaU9pSWpNREF3TURBd0lpd2lZeUk2ZEhKMVpYMD0iLCJleUo0SWpvek9Ua3VPVGs1T1Rrd05EWXpNalUyT0RRc0lua2lPakUyTGpBd01EQXdNRGd6TkRRMk5UQXlOeXdpZHlJNk56VXlMQ0pvSWpveE5pd2labWxzYkVOdmJHOXlJam9pSTJNMVkyWXlaaUlzSW5NaU9pSWpNREF3TURBd0lpd2lkQ0k2TFRFc0luUmpJam9pSXpBd01EQXdNQ0lzSW1NaU9uUnlkV1Y5IiwiZXlKNElqb3pNaTR3TURBd01ERTJOamc1TXpBd05UUXNJbmtpT2pRNExqQXdNREF3TURjeE5USTFOVGMwTENKM0lqb3pNaXdpYUNJNk5qUXNJbVpwYkd4RGIyeHZjaUk2SWlOaVpESmxNRGNpTENKeklqb2lJekF3TURBd01DSXNJblFpT2kweExDSjBZeUk2SWlNd01EQXdNREFpTENKaklqcDBjblZsZlE9PSIsImV5SjRJam94TURjeUxqQXdNREF3TnpZeU9UTTVORFVzSW5raU9qVTFNUzQ1T1RrNU9EZzFOVFU1TURneUxDSjNJam94T1RJc0ltZ2lPakUyTENKbWFXeHNRMjlzYjNJaU9pSWpPV1F6T1RNNUlpd2ljeUk2SWlNd01EQXdNREFpTENKMElqb3pMQ0owWXlJNklpTXdNREF3TURBaUxDSmpJanAwY25WbGZRPT0iLCJleUo0SWpveE1EY3lMakF3TURBd056WXlPVE01TkRVc0lua2lPalV6Tmk0d01EQXdNRE00TVRRMk9UY3pMQ0ozSWpveE5qQXNJbWdpT2pFMkxDSm1hV3hzUTI5c2IzSWlPaUlqWW1VMVlqVmlJaXdpY3lJNklpTXdNREF3TURBaUxDSjBJam96TENKMFl5STZJaU13TURBd01EQWlMQ0pqSWpwMGNuVmxmUT09IiwiZXlKNElqb3hNRGN5TGpBd01EQXdOell5T1RNNU5EVXNJbmtpT2pjeU1Dd2lkeUk2TmpRc0ltZ2lPakUyTENKbWFXeHNRMjlzYjNJaU9pSWpOVEUwTkRBMklpd2ljeUk2SWlNMU16TmpNMk1pTENKMElqbzJMQ0owWXlJNklpTXpOekl6TUdJaUxDSmpJanBtWVd4elpYMD0iLCJleUo0SWpveE1EY3lMakF3TURBd056WXlPVE01TkRVc0lua2lPalUyTnk0NU9UazVOek15T1RjeE1Ua3hMQ0ozSWpveU5UWXNJbWdpT2pFMkxDSm1hV3hzUTI5c2IzSWlPaUlqT1dRek9UTTVJaXdpY3lJNklpTXdNREF3TURBaUxDSjBJam96TENKMFl5STZJaU13TURBd01EQWlMQ0pqSWpwMGNuVmxmUT09IiwiZXlKNElqb3hNRGN5TGpBd01EQXdOell5T1RNNU5EVXNJbmtpT2pVd015NDVPVGs1TnpjeE1URTRNVFkwTENKM0lqb3pNaXdpYUNJNk1UWXNJbVpwYkd4RGIyeHZjaUk2SWlOa1pHRmpZV01pTENKeklqb2lJMkU0WVRoaE9DSXNJblFpT2pNc0luUmpJam9pSTJRMlpEWmtOaUlzSW1NaU9tWmhiSE5sZlE9PSIsImV5SjRJam96T1RrdU9UazVPVGt3TkRZek1qVTJPRFFzSW5raU9qYzVPUzQ1T1RrNU9EQTVNalkxTVRNM0xDSjNJam80TURBc0ltZ2lPak15TENKbWFXeHNRMjlzYjNJaU9pSWpZbVU1TnprM0lpd2ljeUk2SWlNME16TXlNeklpTENKMElqbzBMQ0owWXlJNklpTmtZbU0zWXpjaUxDSmpJanAwY25WbGZRPT0iLCJleUo0SWpveE1EY3lMakF3TURBd056WXlPVE01TkRVc0lua2lPalV5TUM0d01EQXdNVGt3TnpNME9EWXpMQ0ozSWpveE1qZ3NJbWdpT2pFMkxDSm1hV3hzUTI5c2IzSWlPaUlqWkRnM1pEZGtJaXdpY3lJNklpTXdNREF3TURBaUxDSjBJam96TENKMFl5STZJaU13TURBd01EQWlMQ0pqSWpwMGNuVmxmUT09IiwiZXlKNElqb3hNVFV5TGpBd01EQTBOVGMzTmpNMk56SXNJbmtpT2pjd05DNHdNREF3TVRVeU5UZzNPRGt4TENKM0lqb3pNaXdpYUNJNk1qSTBMQ0ptYVd4c1EyOXNiM0lpT2lJalpUaGxPR1U0SWl3aWN5STZJaU0zTURjd056QWlMQ0owSWpveUxDSjBZeUk2SWlOaE1XRXhZVEVpTENKaklqcG1ZV3h6WlgwPSIsImV5SjRJam94TXpVeExqazVPVGsyT1RRNE1qUXlNVGtzSW5raU9qZzFOUzQ1T1RrNU9EUTNOREV5TVRBNUxDSjNJam94Tml3aWFDSTZORGdzSW1acGJHeERiMnh2Y2lJNklpTXdNRGd3TURBaUxDSnpJam9pSXpBd01EQXdNQ0lzSW5RaU9pMHhMQ0owWXlJNklpTXdNREF3TURBaUxDSmpJanBtWVd4elpYMD0iLCJleUo0SWpveE1URXhMams1T1RrMk9UUTRNalF5TVRrc0lua2lPall5TXk0NU9UazVOemN4TVRFNE1UWTBMQ0ozSWpveE5pd2lhQ0k2TXpJc0ltWnBiR3hEYjJ4dmNpSTZJaU13TUdOak1EQWlMQ0p6SWpvaUl6QXdPRFV3WmlJc0luUWlPamdzSW5Saklqb2lJemc0WkdRNU9TSXNJbU1pT21aaGJITmxmUT09IiwiZXlKNElqb3hNekEwTGpBd01EQXhOVEkxT0RjNE9Td2llU0k2T0RVMUxqazVPVGs0TkRjME1USXhNRGtzSW5jaU9qRTJMQ0pvSWpvME9Dd2labWxzYkVOdmJHOXlJam9pSXpBd09EQXdNQ0lzSW5NaU9pSWpNREF3TURBd0lpd2lkQ0k2TFRFc0luUmpJam9pSXpBd01EQXdNQ0lzSW1NaU9tWmhiSE5sZlE9PSIsImV5SjRJam81T1RFdU9UazVPVFk1TkRneU5ESXhPU3dpZVNJNk56QTBMakF3TURBeE5USTFPRGM0T1RFc0luY2lPak15TENKb0lqb3lNalFzSW1acGJHeERiMnh2Y2lJNklpTmxZbVZpWldJaUxDSnpJam9pSXpaaU5tSTJZaUlzSW5RaU9qSXNJblJqSWpvaUkyRTRZVGhoT0NJc0ltTWlPbVpoYkhObGZRPT0iLCJleUo0SWpveE1EY3lMakF3TURBd056WXlPVE01TkRVc0lua2lPall5TXk0NU9UazVOemN4TVRFNE1UWTBMQ0ozSWpveE5pd2lhQ0k2TXpJc0ltWnBiR3hEYjJ4dmNpSTZJaU13TURGbFptWWlMQ0p6SWpvaUl6QXdNV0k0TlNJc0luUWlPamdzSW5Saklqb2lJemhoTjJObU5DSXNJbU1pT21aaGJITmxmUT09IiwiZXlKNElqb3hNRGd3TENKNUlqbzRPREF1TURBd01ERTVNRGN6TkRnMk15d2lkeUk2TmpVMkxDSm9Jam96TWl3aVptbHNiRU52Ykc5eUlqb2lJekF3T0RBd01DSXNJbk1pT2lJak1HSTFNVEEySWl3aWRDSTZOU3dpZEdNaU9pSWpNVEkyWlRFeklpd2lZeUk2ZEhKMVpYMD0iLCJleUo0SWpvek9Ua3VPVGs1T1Rrd05EWXpNalUyT0RRc0lua2lPamc1Tmk0d01EQXdNRE00TVRRMk9UY3pMQ0ozSWpvM05qZ3NJbWdpT2pFMk1Dd2labWxzYkVOdmJHOXlJam9pSXprM05qVTBaQ0lzSW5NaU9pSWpOR0l6TWpBM0lpd2lkQ0k2TlN3aWRHTWlPaUlqWWpnNVpUZzVJaXdpWXlJNmRISjFaWDA9IiwiZXlKNElqb3hNVFV5TGpBd01EQTBOVGMzTmpNMk56SXNJbmtpT2pZeU15NDVPVGs1TnpjeE1URTRNVFkwTENKM0lqb3hOaXdpYUNJNk16SXNJbVpwYkd4RGIyeHZjaUk2SWlOa01EQXhNREVpTENKeklqb2lJelUzTURBd01DSXNJblFpT2pnc0luUmpJam9pSTJabU9HWTRaaUlzSW1NaU9tWmhiSE5sZlE9PSIsImV5SjRJam94TkRjNUxqazVPVGsyTVRnMU16QXlOek1zSW5raU9qWXdOeTQ1T1RrNU9USXpOekEyTURVMUxDSjNJam94TkRRc0ltZ2lPamN6Tml3aVptbHNiRU52Ykc5eUlqb2lJMkl3WWpCaU1DSXNJbk1pT2lJak1EQXdNREF3SWl3aWRDSTZOQ3dpZEdNaU9pSWpaVFpsTldVMUlpd2lZeUk2ZEhKMVpYMD0iLCJleUo0SWpvNU9URXVPVGs1T1RZNU5EZ3lOREl4T1N3aWVTSTZOakl6TGprNU9UazNOekV4TVRneE5qUXNJbmNpT2pFMkxDSm9Jam96TWl3aVptbHNiRU52Ykc5eUlqb2lJMlptTURBd01DSXNJbk1pT2lJak9EQXdNREF3SWl3aWRDSTZPQ3dpZEdNaU9pSWpabVkzWVRkaElpd2lZeUk2Wm1Gc2MyVjkiLCJleUo0SWpveE1ETXlMakF3TURBME5UYzNOak0yTnpJc0lua2lPall5TXk0NU9UazVOemN4TVRFNE1UWTBMQ0ozSWpveE5pd2lhQ0k2TXpJc0ltWnBiR3hEYjJ4dmNpSTZJaU5qWldJM01qSWlMQ0p6SWpvaUkyRmxPV0V4TXlJc0luUWlPamdzSW5Saklqb2lJMlZqWkdZMFlpSXNJbU1pT21aaGJITmxmUT09IiwiZXlKNElqbzVOVEl1TURBd01EQTNOakk1TXprME5Td2llU0k2TmpJekxqazVPVGszTnpFeE1UZ3hOalFzSW5jaU9qRTJMQ0pvSWpvek1pd2labWxzYkVOdmJHOXlJam9pSXpBd1kyTXdNQ0lzSW5NaU9pSWpNR1UzWVRBd0lpd2lkQ0k2T0N3aWRHTWlPaUlqTlRabU5UbGlJaXdpWXlJNlptRnNjMlY5IiwiZXlKNElqb3hNRGN5TGpBd01EQXdOell5T1RNNU5EVXNJbmtpT2pVNU1pNHdNREF3TURjMk1qa3pPVFExTENKM0lqb3pNakFzSW1naU9qTXlMQ0ptYVd4c1EyOXNiM0lpT2lJak9XUXpPVE01SWl3aWN5STZJaU13TURBd01EQWlMQ0owSWpvMkxDSjBZeUk2SWlNd01EQXdNREFpTENKaklqcG1ZV3h6WlgwPSIsImV5SjRJam94TVRreUxqQXdNREF3TnpZeU9UTTVORFVzSW5raU9qWXlNeTQ1T1RrNU56Y3hNVEU0TVRZMExDSjNJam94Tml3aWFDSTZNeklzSW1acGJHeERiMnh2Y2lJNklpTmlOMkl4TURFaUxDSnpJam9pSXpka056a3dPQ0lzSW5RaU9qZ3NJblJqSWpvaUkyVXlaRE16TWlJc0ltTWlPbVpoYkhObGZRPT0iLCJleUo0SWpveE1EY3lMakF3TURBd056WXlPVE01TkRVc0lua2lPalU0TkM0d01EQXdNVFV5TlRnM09Ea3hMQ0ozSWpvek5USXNJbWdpT2pFMkxDSm1hV3hzUTI5c2IzSWlPaUlqT0dNek1UTXhJaXdpY3lJNklpTXdNREF3TURBaUxDSjBJam96TENKMFl5STZJaU13TURBd01EQWlMQ0pqSWpwMGNuVmxmUT09IiwiZXlKNElqb3hNRGN5TGpBd01EQXdOell5T1RNNU5EVXNJbmtpT2pnek1pNHdNREF3TURjMk1qa3pPVFExTENKM0lqb3pOVElzSW1naU9qWTBMQ0ptYVd4c1EyOXNiM0lpT2lJalpESmlObUkySWl3aWN5STZJaU0wTmpNNU16a2lMQ0owSWpvMExDSjBZeUk2SWlObE9XUmtaR1FpTENKaklqcDBjblZsZlE9PSJdLCJ0IjoiZXlKMElqcGJJbVY1U21sSmFtOXBUSHBvUkZWWVpHMVBSbFpFVVc1ak9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVEROa1IwOVdXbGRXYkZwdFZWVlZPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFVXeE9UbEpyYkROV1YzQkRWVEF3T1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBVVlpCTkZGWVJtNVNRemxDVWpGck9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVEhwU1JGRlhaRkZQUld4RVVWZGpPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFUxVkdTbFZXUmtKUlZWWktVVlZWT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBUSHBWTldOcWJHcFJXSEJDVlVSbk9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVVZWMFFsTXdSa3RSVjNSQ1UxVkZPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFRUTmtSVTR3Ums5UFJVVnlaREJGT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBWRmh3VVZSWWNFVlVXSEEyVkZoak9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVkZod1VWUlljRVZVV0hBMlZGaGpPVWxwZDJsamVVazJUMGd3UFNKZGZRPT0iLCJvIjoyMH0=");
  // Start the animation loop

  // TODO: Serialize these:
  object_box = new ObjectBox(500, 700, 30, 30);
  animate();
}

function updateGame() {
  frame = frame + 1;
  // ================== UPDATE ==================
  let now = performance.now();
  let dt = global_speed * (now - ptime) / 1000;

  entity_manager._update(dt);
  ptime = now

  // refactor this garbage
  if (selected.length > 0) {
    if (controller.shift()) {
      if (controller.pressed(Controller.LEFT)) {
        for (let o of selected) {
          o.deltawidth(-8);
        }
      }
      if (controller.pressed(Controller.RIGHT)) {
        for (let o of selected) {
          o.deltawidth(8);
        }
      }
      if (controller.pressed(Controller.UP)) {
        for (let o of selected) {
          o.deltaheight(-8);
        }
      }
      if (controller.pressed(Controller.DOWN)) {
        for (let o of selected) {
          o.deltaheight(8);
        }
      }
    } else {
      if (controller.pressed(Controller.LEFT)) {
        for (let o of selected) {
          o.l();
        }
      }
      if (controller.pressed(Controller.RIGHT)) {
        for (let o of selected) {
          o.r();
        }
      }
      if (controller.pressed(Controller.UP)) {
        for (let o of selected) {
          o.u();
        }
      }
      if (controller.pressed(Controller.DOWN)) {
        for (let o of selected) {
          o.d();
        }
      }
    }

    if (controller.pressed(Controller.DELETE)) {
      for (let o of selected) {
        o.destroy();
      }
      selected = [];
      moveMode.style.display = "none";
    }
    if (controller.pressed(Controller.ESCAPE)) {
      for (let o of selected) {
        o.selected = false;
      }
      selected = [];
      moveMode.style.display = "none";
    }
  } else {
    if (controller.jump()) {
      player.jump();
    }
    if (controller.left()) {
      player.moveLeft();
    }
    if (controller.right()) {
      player.moveRight();
    }
  }

  world.Step(dt, 8, 3);
  controller._update(dt);
  entity_manager.UpdateAll(dt);


  // ================== DRAW ==================
  const context = document.getElementById('myCanvas').getContext('2d');
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  // Draw your game objects here
  entity_manager.DrawAll(context);

  // Debuging info
  drawDebug(context);
}

function drawDebug(ctx) {
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`Velocity: (${player.body.GetLinearVelocity().get_x().toFixed(2)}, ${player.body.GetLinearVelocity().get_y().toFixed(2)})`, 10, 30);
  ctx.fillText(`Entities: ${entity_manager.size()} Drawables: ${entity_manager.drawables.size}`, 10, 50);
  ctx.fillText(`MovementState: ${player.movementState.constructor.name}`, 10, 70);
  if (debug_collisions) {
    const debugLines = player.debuginfo().split('\n');
    let y = 90;
    for (let line of debugLines) {
      ctx.fillText(line.trim(), 10, y);
      y += 20; // Space each line 20 pixels apart
    }
    const velocityHistory = player.velocityHistory;
    if (velocityHistory.length > 0) {
      const graphHeight = 100;
      ctx.beginPath();
      ctx.moveTo(10, window.innerHeight - 200 - (velocityHistory[0] / 10) * graphHeight);
      for (let i = 0; i < velocityHistory.length; i++) {
        const x = 10 + i * 2;
        const y = window.innerHeight - 200 - (velocityHistory[i] / 10) * graphHeight;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
  }
}

class ContactListener extends b2.JSContactListener {
  static ColideEvent = function (c, type) {
    let contact = Box2D.wrapPointer(c, b2.b2Contact);
    let a = entity_manager.Get(contact.GetFixtureA().a);
    let b = entity_manager.Get(contact.GetFixtureB().a);
    if (a instanceof SensorInfo && b instanceof SensorInfo) { return; }
    if (debug_collisions) {
      console.log((type == 1 ? "Enter" : "Leave") + " on frame " + frame);
      console.log(a);
      console.log(b);
      console.log("-------------");
    }
    if (a instanceof Collidable) {
      a._Collision(type, a.side, b);
    }
    if (b instanceof Collidable) {
      b._Collision(type, b.side, a);
    }
  }

  BeginContact = function (c) { ContactListener.ColideEvent(c, SensorBox.ENTER); }
  EndContact = function (c) { ContactListener.ColideEvent(c, SensorBox.LEAVE); }
  PreSolve = function (c, d) { }
  PostSolve = function (c, d) { }
}


function savePlatforms() {
  let platforms = entity_manager
    .drawables
    .values()
    .filter(d => d.target instanceof Platform)
    .map(d => d.target.serialize())
    .toArray();
  return btoa(JSON.stringify({
    p: platforms,
    t: tex_manager.serialize(),
    o: entity_manager.PlayerOrder()
  }));
}

function loadPlatforms(str) {
  for (let drawable of entity_manager.drawables.values()) {
    if (drawable.target instanceof Platform) {
      drawable.target.destroy();
    }
  }
  entity_manager._cleanup_now();

  // Deserialize the ones created by savePlatforms
  const data = JSON.parse(atob(str));
  for (let i = 0; i < data.p.length; i++) {
    Platform.deserialize(data.p[i]);
  }
  tex_manager.deserialize(data.t);
  for (let i = 0; i < data.o; i++) {
    entity_manager.OrderHigher(player.__removekey);
  }

}

function animate() {
  updateGame();
  requestAnimationFrame(animate);
}

// Initialize the game when the canvas is resized
resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

// ========================= Mouse stuff =============================
let startDrawX, startDrawY;
let new_pl = null;
let isDrawingPlatform = false;
let selected = [];
let mouseMoved = false;
let pmx = 0;
let pmy = 0;

canvas.addEventListener('mousedown', function (event) {
  if (event.button != 0) return;
  isDrawingPlatform = true;
  startDrawX = grid(event.clientX + camera.dx(), 16);
  startDrawY = grid(event.clientY + camera.dy(), 16);
  pmx = event.clientX + camera.dx();
  pmy = event.clientY + camera.dy()
  mouseMoved = false;
});

canvas.addEventListener('mousemove', function (event) {
  mouseMoved = true;
  let mx = event.clientX + camera.dx();
  let my = event.clientY + camera.dy();
  if (!isDrawingPlatform) return;
  if (selected.length > 0) {
    for (let o of selected) {
      o.translate((mx - pmx) / UNITS, (my - pmy) / UNITS)
    }
  }
  pmx = mx;
  pmy = my;
  if (selected.length > 0) {
    return;
  }

  let endDrawX = grid(mx, 16);
  let endDrawY = grid(my, 16);

  // Remove the previous platform
  if (new_pl != null) {
    new_pl.destroy();
    entity_manager._cleanup_now();
  }

  // Create a new platform
  let width = Math.abs(endDrawX - startDrawX);
  let height = Math.abs(endDrawY - startDrawY);
  let x = Math.min(startDrawX, endDrawX) + width / 2;
  let y = Math.min(startDrawY, endDrawY) + height / 2;
  new_pl = new Platform(x, y, width, height);
});

canvas.addEventListener('mouseup', function (event) {
  if (!mouseMoved) {
    let lastObject = null;
    for (let object of entity_manager.drawables.values()) {
      if (object.target.containsMouse(event.clientX, event.clientY)) {
        lastObject = object.target;
      }
    }
    if (lastObject != null) {
      let wasinselected = selected.indexOf(lastObject) != -1;
      if (!controller.shift()) {
        for (let o of selected) {
          o.selected = false;
          moveMode.style.display = "none";
          selected = [];
        }
      }
      if (!wasinselected) {
        selected.push(lastObject);
        moveMode.style.display = "";
        lastObject.selected = true;
      } else {
        lastObject.selected = false;
        selected.splice(selected.indexOf(lastObject), 1);
      }
    } else if (selected.length > 0) {
      for (let o of selected) {
        o.selected = false;
      }
      moveMode.style.display = "none";
      selected = [];
    }
  }
  isDrawingPlatform = false;
  new_pl = null;
});

canvas.addEventListener('contextmenu', function (event) {
  event.preventDefault();
  let mouseX = event.clientX;
  let mouseY = event.clientY;
  let lastObject = null;
  for (let object of entity_manager.drawables.values()) {
    if (object.target.containsMouse(mouseX, mouseY)) {
      lastObject = object.target;
    }
  }
  if (lastObject) {
    if (pe != null) { pe.destroy(); }
    new GUIWindow(mouseX + 20, mouseY + 20, 320, 200, lastObject);
  }
});

canvas.addEventListener('wheel', function (event) {
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  let lastObject = null;
  for (let object of entity_manager.drawables.values()) {
    if (object.target.containsMouse(mouseX, mouseY)) {
      lastObject = object;
    }
  }
  if (lastObject) {
    if (event.deltaY < 0) {
      entity_manager.OrderLower(lastObject);
    } else if (event.deltaY > 0) {
      entity_manager.OrderHigher(lastObject);
    }
  }
});

canvas.addEventListener('auxclick', function (event) { // middle click
  event.preventDefault();
  let mouseX = event.clientX;
  let mouseY = event.clientY;


  let lastObject = null;
  for (let object of entity_manager.drawables.values()) {
    if (object.target.containsMouse(mouseX, mouseY)) {
      lastObject = object.target;
    }
  }
  if (lastObject != null) {
  }
});

// Start

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
initGame();
