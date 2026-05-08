import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trophy, Check, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { teams, getRealTeams } from '@/data/teams';
import { getMatchesByTeam } from '@/data/matches';
import { cn } from '@/lib/utils';

type ConfederationFilter = 'all' | 'CONCACAF' | 'CONMEBOL' | 'UEFA' | 'AFC' | 'CAF' | 'OFC';

const confederationLabels: Record<ConfederationFilter, string> = {
  all: 'Todas',
  CONCACAF: 'CONCACAF',
  CONMEBOL: 'CONMEBOL',
  UEFA: 'UEFA',
  AFC: 'AFC',
  CAF: 'CAF',
  OFC: 'OFC',
};

const Teams: React.FC = () => {
  const [confederation, setConfederation] = useState<ConfederationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const realTeams = getRealTeams();

  const filteredTeams = realTeams.filter(team => {
    if (confederation !== 'all' && team.confederation !== confederation) return false;
    if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const confirmedCount = realTeams.filter(t => t.isConfirmed).length;
  const pendingCount = realTeams.filter(t => !t.isConfirmed).length;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-6xl mb-4">
            <span className="gold-text">Seleções</span> Participantes
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            48 seleções de todos os continentes competindo pelo título mundial. 
            {pendingCount > 0 && ` ${pendingCount} vagas ainda serão definidas nas repescagens.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl glass-card text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
            <span className="font-display text-2xl block">{realTeams.length}</span>
            <span className="text-xs text-muted-foreground">Total de Seleções</span>
          </div>
          <div className="p-4 rounded-xl glass-card text-center">
            <Check className="w-6 h-6 text-success mx-auto mb-2" />
            <span className="font-display text-2xl block">{confirmedCount}</span>
            <span className="text-xs text-muted-foreground">Confirmadas</span>
          </div>
          <div className="p-4 rounded-xl glass-card text-center">
            <HelpCircle className="w-6 h-6 text-primary mx-auto mb-2" />
            <span className="font-display text-2xl block">{pendingCount}</span>
            <span className="text-xs text-muted-foreground">Repescagem</span>
          </div>
          <div className="p-4 rounded-xl glass-card text-center">
            <span className="text-2xl block mb-1">🏆</span>
            <span className="font-display text-2xl block">104</span>
            <span className="text-xs text-muted-foreground">Jogos</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar seleção..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(confederationLabels) as ConfederationFilter[]).map((conf) => (
              <Button
                key={conf}
                variant={confederation === conf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfederation(conf)}
                className={confederation === conf ? 'gold-gradient' : ''}
              >
                {confederationLabels[conf]}
              </Button>
            ))}
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTeams.map((team, index) => {
            const matchCount = getMatchesByTeam(team.id).length;

            return (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className={cn(
                  "relative p-4 rounded-xl border text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-fade-in block",
                  team.isConfirmed
                    ? "bg-card border-border hover:border-primary/50"
                    : "bg-card/50 border-dashed border-primary/30"
                )}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {/* Status Badge */}
                {!team.isConfirmed && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                {team.flag.startsWith('http') ? (
                  <img src={team.flag} alt={`Bandeira ${team.name}`} className="w-10 h-7 object-cover rounded mx-auto mb-2" />
                ) : (
                  <span className="text-4xl block mb-2">{team.flag}</span>
                )}
                <h3 className="font-medium text-sm mb-1">{team.name}</h3>
                <span className="text-xs text-muted-foreground block mb-2">{team.code}</span>

                <div className="flex items-center justify-center gap-1 text-xs">
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                    {team.confederation}
                  </span>
                </div>

                {team.group && (
                  <span className="block mt-2 text-xs text-primary font-medium">
                    Grupo {team.group}
                  </span>
                )}

                {matchCount > 0 && (
                  <span className="block mt-2 text-xs text-muted-foreground">
                    {matchCount} jogos
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Nenhuma seleção encontrada.</p>
            <Button variant="outline" onClick={() => { setConfederation('all'); setSearchQuery(''); }}>
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 p-6 rounded-xl glass-card">
          <h3 className="font-display text-lg mb-4">Legenda</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-card border border-border" />
              <span className="text-sm text-muted-foreground">Classificação confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-card/50 border border-dashed border-primary/30" />
              <span className="text-sm text-muted-foreground">Aguardando repescagem (simulado)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams;