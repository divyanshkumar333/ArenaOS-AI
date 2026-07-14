import asyncio
from ai_agent import analyze_incident

async def main():
    zone_mock = {'name': 'Test Zone', 'occupancy': 95}
    scenarios = ['Gate 3 Overcrowding', 'Section 112 Medical Event', 'Concourse North Fire Alarm']
    for s in scenarios:
        res = await analyze_incident(zone_mock, s)
        print(f'--- {s} ---')
        print('Explanation:', res['explanation'])
        print('Action:', res['recommended_action'])
        print('')

asyncio.run(main())
