import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Users, Languages, Trophy, Calendar, Star, Award,
  Sparkles, Flame, Crown, Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTeamById } from '@/data/teams';
import { getMatchesByTeam } from '@/data/matches';
import { getTeamProfile } from '@/data/team-profiles';

const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const team = id ? getTeamById(id) : undefined;
  const profile = id ? getTeamProfile(id) : undefined;
  const matches = team && !team.isTBD ? getMatchesByTeam(team.id) : [];

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4">Seleção não encontrada</h1>
          <Link to="/teams">
            <Button>Voltar para seleções</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasFlagUrl = team.flag.startsWith('http');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary/15 via-card to-background border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Link to="/teams" className="inline-block mb-6">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para seleções
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {hasFlagUrl ? (
              <img
                src={team.flag}
                alt={`Bandeira ${team.name}`}
                className="w-32 h-20 md:w-40 md:h-28 object-cover rounded-xl shadow-2xl border-2 border-border"
              />
            ) : (
              <span className="text-7xl md:text-8xl">{team.flag}</span>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">{team.confederation}</Badge>
                {team.group && <Badge variant="outline">Grupo {team.group}</Badge>}
                {profile && profile.titles > 0 && (
                  <Badge className="bg-gold/20 text-gold border-gold/40">
                    <Crown className="w-3 h-3 mr-1" />
                    {profile.titles}× campeã mundial
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-6xl mb-2">{team.name}</h1>
              <p className="text-muted-foreground">
                <span className="font-mono text-base">{team.code}</span>
                {profile && (
                  <>
                    {' · '}
                    {profile.worldCupAppearances}ª participação em Copas
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {profile ? (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna principal — narrativa */}
            <div className="lg:col-span-2 space-y-8">
              {/* História */}
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-primary" />
                    História do Futebol em {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                  {profile.history.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </CardContent>
              </Card>

              {/* Jogadores Icônicos */}
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center gap-2">
                    <Star className="w-6 h-6 text-primary" />
                    Jogadores Icônicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {profile.iconicPlayers.map((player) => (
                      <div
                        key={player.name}
                        className="p-4 rounded-xl bg-secondary/40 border border-border/50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-base">{player.name}</h3>
                          <span className="text-xs text-muted-foreground font-mono">
                            {player.era}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">{player.note}</p>
                      </div>
                    ))}
                  </div>
                  {profile.topScorerInWorldCups && (
                    <div className="mt-6 p-4 rounded-xl bg-gold/10 border border-gold/30">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-5 h-5 text-gold" />
                        <span className="font-medium">Maior artilheiro em Copas:</span>
                        <span className="text-gold font-display text-base">
                          {profile.topScorerInWorldCups.name}
                        </span>
                        <span className="text-muted-foreground">
                          ({profile.topScorerInWorldCups.goals} gols)
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Curiosidades */}
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Curiosidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {profile.curiosities.map((curio, i) => (
                      <li key={i} className="flex gap-3 text-muted-foreground leading-relaxed">
                        <span className="text-primary mt-1">•</span>
                        <span>{curio}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Jogo memorável + Rivalidade */}
              {(profile.notableMatch || profile.rivalry) && (
                <Card className="rounded-2xl border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl flex items-center gap-2">
                      <Flame className="w-6 h-6 text-primary" />
                      Memória e Rivalidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.notableMatch && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">
                          Jogo memorável
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {profile.notableMatch}
                        </p>
                      </div>
                    )}
                    {profile.rivalry && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">
                          Rivalidades clássicas
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">{profile.rivalry}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar — fatos */}
            <div className="space-y-6">
              {/* País */}
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Sobre o país</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Capital</div>
                      <div className="font-medium">{profile.capital}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">População</div>
                      <div className="font-medium">{profile.population}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Languages className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Idioma</div>
                      <div className="font-medium">{profile.language}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tradição em Copas */}
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Em Copas do Mundo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Participações</div>
                    <div className="font-display text-2xl text-primary">
                      {profile.worldCupAppearances}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Títulos mundiais</div>
                    <div className="font-display text-2xl text-gold flex items-center gap-1">
                      {profile.titles}
                      {profile.titles > 0 && (
                        <span className="text-base">{'⭐'.repeat(profile.titles)}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Melhor resultado</div>
                    <div className="font-medium text-sm">{profile.bestResult}</div>
                  </div>
                  {profile.firstWorldCup && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Primeira Copa</div>
                      <div className="font-medium">{profile.firstWorldCup}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Classificação 2026</div>
                    <div className="font-medium text-sm">{profile.qualifyingMethod}</div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA jogos */}
              {matches.length > 0 && (
                <Card className="rounded-2xl border-border bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <Calendar className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong className="text-foreground">{matches.length}</strong>{' '}
                      {matches.length === 1 ? 'jogo na fase de grupos' : 'jogos na fase de grupos'}
                    </p>
                    <Link to={`/matches?team=${team.id}`}>
                      <Button className="w-full gold-gradient">
                        <Ticket className="w-4 h-4 mr-2" />
                        Ver jogos de {team.code}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">
            Perfil completo desta seleção em breve.
          </p>
          <Link to="/teams">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default TeamDetail;
