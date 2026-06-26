import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Info, HelpCircle, Scale, Users, Clock, Target, AlertTriangle } from "lucide-react"
import { APP_NAME } from "@/lib/brand"
import { isWcEventEnabled } from "@/lib/competition-config"

export default function InfoPage() {
  const wcEventEnabled = isWcEventEnabled()
  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Information</h1>
        <p className="text-muted-foreground">Everything you need to know about {APP_NAME}</p>
      </div>

      <Tabs defaultValue="rules" className="space-y-4 min-w-0">
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-none md:mx-0 md:px-0">
          <TabsList className="inline-flex w-max min-w-full md:w-auto h-auto flex-nowrap">
            <TabsTrigger value="rules" className="flex items-center gap-2 shrink-0">
              <Scale className="h-4 w-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2 shrink-0">
              <Trophy className="h-4 w-4" />
              Scoring
            </TabsTrigger>
            <TabsTrigger value="pointers" className="flex items-center gap-2 shrink-0">
              <Target className="h-4 w-4" />
              Pointers
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2 shrink-0">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2 shrink-0">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rules" className="space-y-4">
          <Card className="pl-card">
            <CardHeader>
              <CardTitle>Game Rules</CardTitle>
              <CardDescription>How to play {APP_NAME}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-pl-purple" />
                  Participation
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Create an account to join the prediction game</li>
                  <li>Customize your profile with a picture and your supported team</li>
                  <li>Invite your friends to compete against each other</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pl-purple" />
                  Predictions
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Predict the score for each Premier League match</li>
                  <li>Predictions must be submitted before the match kickoff time</li>
                  <li>You can change your prediction any time before kickoff</li>
                  <li>Once a match starts, predictions are locked</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-pl-purple" />
                  Leaderboard
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Leaderboards are updated after each match</li>
                  <li>There are separate leaderboards for each matchweek</li>
                  <li>Your position is determined by total points earned</li>
                  <li>Ties are broken by number of exact scores predicted</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <Card className="pl-card">
            <CardHeader>
              <CardTitle>Scoring System</CardTitle>
              <CardDescription>How points are calculated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wcEventEnabled && (
                <div className="flex gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">90- or 120-minute scores</p>
                    <p className="text-muted-foreground">
                      Predict the score after 90 minutes of regular time, or after extra time (120
                      minutes) if the match goes there. Penalty shootout goals are never included in
                      the score — agree on this with your group before the Round of 32 kicks off.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="text-green-600 dark:text-green-400 font-bold text-xl mb-2">4 Points</div>
                  <div className="font-medium mb-1">Exact Score</div>
                  <p className="text-sm text-muted-foreground">
                    You predicted the exact final score of the match (e.g., 2-1)
                  </p>
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-green-100 dark:border-green-900/30 text-sm">
                    <div className="font-medium">Example:</div>
                    <div className="flex justify-between mt-1">
                      <span>Your prediction: 2-1</span>
                      <span>Final score: 2-1</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="text-blue-600 dark:text-blue-400 font-bold text-xl mb-2">2 Points</div>
                  <div className="font-medium mb-1">Correct Result</div>
                  <p className="text-sm text-muted-foreground">
                    You predicted the correct outcome (home win, away win, or draw) but not the exact score
                  </p>
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-blue-100 dark:border-blue-900/30 text-sm">
                    <div className="font-medium">Example:</div>
                    <div className="flex justify-between mt-1">
                      <span>Your prediction: 2-0</span>
                      <span>Final score: 3-1</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                  <div className="text-red-600 dark:text-red-400 font-bold text-xl mb-2">0 Points</div>
                  <div className="font-medium mb-1">Incorrect Result</div>
                  <p className="text-sm text-muted-foreground">You predicted the wrong outcome of the match</p>
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-red-100 dark:border-red-900/30 text-sm">
                    <div className="font-medium">Example:</div>
                    <div className="flex justify-between mt-1">
                      <span>Your prediction: 2-1</span>
                      <span>Final score: 1-1</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Tiebreakers</h3>
                <p className="text-sm text-muted-foreground">
                  If two or more players have the same number of points, the following tiebreakers are applied in order:
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Number of exact scores predicted</li>
                  <li>Number of correct results predicted</li>
                  <li>If still tied, players share the same position</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pointers" className="space-y-4">
          <Card className="pl-card">
            <CardHeader>
              <CardTitle>Pointers System</CardTitle>
              <CardDescription>Earn bonus points with special predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-pl-purple" />
                  What are Pointers?
                </h3>
                <p className="text-muted-foreground">
                  Pointers are special predictions about events that might occur during matches in a matchweek. Unlike
                  regular score predictions, pointers apply to any match in the matchweek and can earn you bonus points
                  - but be careful, incorrect pointers will cost you points!
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pl-purple" />
                  How to Use Pointers
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Select pointers for each active matchweek from the Predictions page</li>
                  <li>You can select multiple pointers per matchweek</li>
                  <li>Pointer selections must be submitted before the first match of the matchweek</li>
                  <li>Points are calculated after all matches in the matchweek are completed</li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Available Pointers</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="font-medium">Red Card</span>
                      <div className="ml-auto flex gap-1">
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">+2</span>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-1</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      A red card will be shown during any match in the matchweek
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Penalty Goal</span>
                      <div className="ml-auto flex gap-1">
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">+2</span>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-1</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      A goal will be scored from a penalty kick in any match
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <span className="font-medium">No Yellow Cards</span>
                      <div className="ml-auto flex gap-1">
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">+5</span>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-3</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No yellow cards will be shown during a specific match
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium">Own Goal</span>
                      <div className="ml-auto flex gap-1">
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">+2</span>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-1</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">An own goal will be scored during any match</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-100 p-2 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">Goalkeeper Goal</span>
                      <div className="ml-auto flex gap-1">
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">+10</span>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-5</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">A goalkeeper will score a goal in any match</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <Trophy className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="font-medium">Hat Trick</span>
                      <div className="ml-auto flex gap-1">
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">+4</span>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-2</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      A player will score a hat trick (3+ goals) in any match
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <Trophy className="h-4 w-4 text-cyan-600" />
                      </div>
                      <span className="font-medium">Man of the Match</span>
                      <div className="ml-auto flex gap-1">
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">+3</span>
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-1</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Predict the Man of the Match for a specific match</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Risk vs. Reward
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Pointers add an element of risk to your predictions. While correct pointers can significantly boost
                  your score, incorrect ones will subtract points. Choose wisely based on your confidence level!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card className="pl-card">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions about {APP_NAME}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-semibold">What happens if I miss a prediction deadline?</h3>
                <p className="text-sm text-muted-foreground">
                  If you miss a prediction deadline, you won't earn any points for that match. Make sure to submit your
                  predictions before kickoff!
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">Can I change my prediction after submitting it?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can change your prediction any time before the match kickoff. Once the match starts,
                  predictions are locked.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">How do I invite friends to join?</h3>
                <p className="text-sm text-muted-foreground">
                  You can share the link to the website with your friends. They can create an account and start making
                  predictions right away.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">What happens if a match is postponed?</h3>
                <p className="text-sm text-muted-foreground">
                  If a match is postponed, your predictions remain valid for when the match is rescheduled. You can
                  update your prediction until the new kickoff time.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">How do I set my favorite team flair?</h3>
                <p className="text-sm text-muted-foreground">
                  Go to your profile page and click on "Edit Profile". You can select your favorite team from the
                  dropdown menu.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">Can I create a private league for just my friends?</h3>
                <p className="text-sm text-muted-foreground">
                  Currently, all users compete in the same leaderboard. Private leagues may be added in a future update.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">How do pointers work?</h3>
                <p className="text-sm text-muted-foreground">
                  Pointers are special predictions about events that might occur during matches in a matchweek. You can
                  select pointers from the Predictions page. Correct pointers earn you bonus points, but incorrect ones
                  will cost you points.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card className="pl-card">
            <CardHeader>
              <CardTitle>About {APP_NAME}</CardTitle>
              <CardDescription>The Premier League prediction game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                {APP_NAME} is a Premier League prediction game designed for friends to compete against each other. The game
                was created to make watching Premier League matches even more exciting by adding a competitive element
                among friends.
              </p>

              <p>
                Each matchweek, players predict the scores for all Premier League matches and earn points based on the
                accuracy of their predictions. The leaderboard shows who has the best football knowledge among your
                friend group!
              </p>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-sm text-muted-foreground">
                  If you have any questions, suggestions, or feedback, please contact the administrator of your {APP_NAME}
                  group.
                </p>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p>{APP_NAME} is not affiliated with or endorsed by the Premier League.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
