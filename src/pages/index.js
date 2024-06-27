import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Box, Container, Heading, Select, Text, VStack, HStack, Image } from '@chakra-ui/react';

export default function Home() {
  const [competitions, setCompetitions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [id, setId] = useState(null);
  const [matchdayOptions, setMatchdayOptions] = useState([]);
  const [selectedMatchday, setSelectedMatchday] = useState(1);
  const [teams, setTeams] = useState([]);
  const [code, setCode] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('/api/competitions', {
          headers: {
            'X-Auth-Token': '6311a66f5f8746fd8860a5de6173f49f',
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar competições');
        }

        const data = await response.json();
        setCompetitions(data.competitions || []);
      } catch (error) {
        console.error('Erro ao carregar as competições:', error);
      }
    };

    fetchCompetitions();
  }, []);

  const handleSelectChange = async (event) => {
    setMatches([]);
    setTeams([]);
    const selectedId = event.target.value;
    const selectedCompetition = competitions.find((comp) => comp.id === Number(selectedId));
    let selectedCode = '';
    if (selectedCompetition) {
      selectedCode = selectedCompetition.code;
      setId(selectedId);
    }

    try {
      const response = await fetch(`/api/competitions?id=${selectedId}`, {
        headers: {
          'X-Auth-Token': '6311a66f5f8746fd8860a5de6173f49f',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar partidas');
      }

      const data = await response.json();
      setMatches(data.matches || []);

      if (data.matches && data.matches.length > 0) {
        const firstMatch = data.matches[0];
        const { season } = firstMatch;
        const { currentMatchday } = season;

        const options = Array.from({ length: currentMatchday }, (_, index) => index + 1);
        setMatchdayOptions(options);
      } else {
        setMatchdayOptions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar as partidas:', error);
    }

    setCode(selectedCode);

    try {
      const response = await fetch(`/api/competitions?code=${selectedCode}`, {
        headers: {
          'X-Auth-Token': '6311a66f5f8746fd8860a5de6173f49f',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar times');
      }

      const data = await response.json();
      console.log(data.teams)
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Erro ao carregar as partidas:', error);
    }
  };

  const handleMatchdayChange = async (event) => {
    setMatches([]);
    const selectedMatchday = parseInt(event.target.value);
    setSelectedMatchday(selectedMatchday);

    try {
      const response = await fetch(`/api/competitions/${id}/matches?matchday=${selectedMatchday}`, {
        headers: {
          'X-Auth-Token': '6311a66f5f8746fd8860a5de6173f49f',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches for the matchday');
      }

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches for the matchday:', error);
    }
  };

  const handleTeam = async (event) => {
    if (event.target.value !== '') {
      const teamId = parseInt(event.target.value);

      const filteredMatches = matches.filter(
        (match) => match.awayTeam.id === teamId || match.homeTeam.id === teamId
      );

      setMatches(filteredMatches);
    } else {
      try {
        const response = await fetch(`/api/competitions?id=${id}`, {
          headers: {
            'X-Auth-Token': '6311a66f5f8746fd8860a5de6173f49f',
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar partidas');
        }

        const data = await response.json();
        setMatches(data.matches || []);
      } catch (error) {
        console.error('Erro ao carregar as partidas:', error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Jogos de futebol</title>
      </Head>
      <Box bg="gray.100" minH="100vh" py={10}>
        <Container maxW="container.lg" bg="white" borderRadius="xl" p={6} boxShadow="xl">
          <Heading as="h1" size="xl" mb={6} textAlign="center" color="blue.600">
            Jogos de futebol
          </Heading>
          <VStack spacing={4} align="stretch">
            <Select placeholder="Selecione uma competição" onChange={handleSelectChange} mb={6} borderColor="blue.400">
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name}
                </option>
              ))}
            </Select>
            {teams.length > 0 && (
              <Select placeholder="Selecione uma equipe" onChange={handleTeam} mb={6} borderColor="blue.400">
                {teams.map((option) => (
                  <option key={option.id} value={option.id}>
                    <HStack align="center">
                      <Image src={option.crest} boxSize="20px" alt={option.name} mx={2} />
                      <Text>{option.name}</Text>
                    </HStack>
                  </option>
                ))}
              </Select>
            )}
            {matchdayOptions.length > 0 && (
              <Select
                placeholder="Selecione uma rodada"
                onChange={handleMatchdayChange}
                value={selectedMatchday}
                mb={6}
                borderColor="blue.400"
              >
                {matchdayOptions.map((option) => (
                  <option key={option} value={option}>
                    Rodada {option}
                  </option>
                ))}
              </Select>
            )}
          </VStack>
          <Box width="100%" mt={6}>
            {matches.map((match) => (
              <Box key={match.id} p={4} borderWidth="1px" borderRadius="md" mb={4} bg="gray.200" boxShadow="sm">
                <HStack justify="space-between" align="center">
                  <HStack align="center">
                    <Image src={match.homeTeam.crest} boxSize="20px" alt={match.homeTeam.name} mx={2} />
                    <Text>{match.homeTeam.name}</Text>
                  </HStack>
                  <Text>{match.score.fullTime.home} - {match.score.fullTime.away}</Text>
                  <HStack align="center">
                    <Text>{match.awayTeam.name}</Text>
                    <Image src={match.awayTeam.crest} boxSize="20px" alt={match.awayTeam.name} mx={2} />
                  </HStack>
                </HStack>
                <Text mt={2} textAlign="center">
                  {new Date(match.utcDate).toLocaleString()}
                </Text>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </>
  );
}
