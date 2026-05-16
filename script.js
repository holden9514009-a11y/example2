/**
 * 2026학년도 하반기 청소 당번 자동 배정 알고리즘
 * - 26명의 학생 데이터를 바탕으로 희망 날짜와 1~3지망 구역을 우선 배치합니다.
 */

// 1. 청소 구역 정의 (총 5구역)
const ROLES = {
    'sweep12': '교실 쓸기(1/2)',
    'sweep34': '교실 쓸기(3/4)',
    'mop12': '교실 닦기(1/2)',
    'mop34': '교실 닦기(3/4)',
    'hallway': '복도 쓸고 닦기'
};

// 2. 가상의 학생 데이터 26명 생성 (실제로는 Google Sheets나 DB에서 가져와야 함)
// 선생님의 테스트를 돕기 위한 임시 데이터입니다.
function generateMockStudents() {
    const students = [];
    const roleKeys = Object.keys(ROLES);
    const mockDates = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05'];

    for (let i = 1; i <= 26; i++) {
        // 역할을 무작위로 3개 섞어서 1,2,3지망 설정
        const shuffledRoles = [...roleKeys].sort(() => 0.5 - Math.random());
        students.push({
            id: i,
            name: `학생${i}`,
            desiredDates: mockDates, // 테스트용으로 동일한 주간을 희망했다고 가정
            choices: [shuffledRoles[0], shuffledRoles[1], shuffledRoles[2]]
        });
    }
    return students;
}

// 3. 자동 배정 알고리즘
function assignCleaning(students) {
    const schedule = {}; // 최종 결과가 담길 객체

    // 학생들 배열을 무작위로 섞어 매번 특정 번호가 유리해지는 것을 방지 (공평성)
    const shuffledStudents = [...students].sort(() => 0.5 - Math.random());

    // 1단계: 희망 날짜에 빈자리가 있는지 확인하고 배정
    shuffledStudents.forEach(student => {
        student.desiredDates.forEach(date => {
            // 해당 날짜의 스케줄 객체가 없으면 생성
            if (!schedule[date]) {
                schedule[date] = {
                    'sweep12': null, 'sweep34': null, 'mop12': null, 'mop34': null, 'hallway': null
                };
            }

            let assigned = false;

            // 1~3지망 순서대로 자리가 비었는지 확인
            for (let i = 0; i < student.choices.length; i++) {
                const choice = student.choices[i];
                if (schedule[date][choice] === null) {
                    schedule[date][choice] = student.name + `(${student.id}번)`;
                    assigned = true;
                    break; // 배정되었으면 다음 지망은 보지 않음
                }
            }

            // 2단계: 1~3지망이 모두 찼지만, 그 날짜에 다른 빈 구역이 있다면 배정 (희망 날짜 우선)
            if (!assigned) {
                for (const role in schedule[date]) {
                    if (schedule[date][role] === null) {
                        schedule[date][role] = student.name + `(${student.id}번)`;
                        break;
                    }
                }
            }
        });
    });

    return schedule;
}

// 4. 결과를 화면에 표(Table) 형태로 그려주는 함수
function renderSchedule(schedule) {
    let html = `<h2 style="color: #554433; text-align: center; margin-top: 40px;">🧹 청소 배정 결과표</h2>`;
    html += `<table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;">`;
    
    // 테이블 헤더
    html += `
        <tr style="background-color: #88c9a1; color: white;">
            <th style="padding: 12px; border: 1px solid #e0e0e0;">날짜</th>
            <th style="padding: 12px; border: 1px solid #e0e0e0;">${ROLES['sweep12']}</th>
            <th style="padding: 12px; border: 1px solid #e0e0e0;">${ROLES['sweep34']}</th>
            <th style="padding: 12px; border: 1px solid #e0e0e0;">${ROLES['mop12']}</th>
            <th style="padding: 12px; border: 1px solid #e0e0e0;">${ROLES['mop34']}</th>
            <th style="padding: 12px; border: 1px solid #e0e0e0;">${ROLES['hallway']}</th>
        </tr>
    `;

    // 테이블 본문 (날짜순 정렬)
    const sortedDates = Object.keys(schedule).sort();
    
    sortedDates.forEach(date => {
        const dayPlan = schedule[date];
        html += `
            <tr style="text-align: center; border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-weight: bold; color: #5d9e78;">${date}</td>
                <td style="padding: 12px;">${dayPlan['sweep12'] || '<span style="color:#ccc;">공석</span>'}</td>
                <td style="padding: 12px;">${dayPlan['sweep34'] || '<span style="color:#ccc;">공석</span>'}</td>
                <td style="padding: 12px;">${dayPlan['mop12'] || '<span style="color:#ccc;">공석</span>'}</td>
                <td style="padding: 12px;">${dayPlan['mop34'] || '<span style="color:#ccc;">공석</span>'}</td>
                <td style="padding: 12px;">${dayPlan['hallway'] || '<span style="color:#ccc;">공석</span>'}</td>
            </tr>
        `;
    });

    html += `</table>`;
    
    // HTML에 id가 'resultArea'인 div가 있다고 가정하고 출력
    const resultDiv = document.getElementById('resultArea');
    if(resultDiv) {
        resultDiv.innerHTML = html;
    } else {
        // resultArea가 없으면 body 맨 끝에 추가
        const newDiv = document.createElement('div');
        newDiv.innerHTML = html;
        document.body.appendChild(newDiv);
    }
}

// 5. 실행을 담당하는 메인 함수 (버튼 클릭 시 실행)
function runAssignment() {
    const studentsData = generateMockStudents(); // 데이터 불러오기
    const finalSchedule = assignCleaning(studentsData); // 알고리즘 돌리기
    renderSchedule(finalSchedule); // 화면에 그리기
}
