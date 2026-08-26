from collections import defaultdict
from dataclasses import dataclass, field
import math
import random
import sys
from typing import Dict, List, Tuple, TypeVar, Union, Any
import asyncio

T = TypeVar("T")


@dataclass
class DiagonalGrid:
    """
    Represents a grid of primary and secondary elements generated under spatial constraints.

    Layout Rules:
    - Primary elements are distributed evenly along grid diagonals.
    - Secondary elements are distributed evenly and randomly across the overall grid.
    - Secondary elements maintain an even, randomized distribution across primary elements.
    - Spatial Constraint: No two identical secondary elements may occupy adjacent cells
      (8-way Moore neighborhood).
    """

    grid_size: int
    # Store primary_elements in order: ['red', 'blue'] or ['X', 'O'] or [Stitch.SINGLE, Stitch.DOUBLE]
    primary_elements: List[T] = field(default_factory=list)
    secondary_elements: List[T] = field(default_factory=list)

    # Inner list = row/diagonal counts
    # Outer list index maps 1:1 with element index in `primary_elements`
    distribution_by_id: List[List[Union[int, float]]] = field(default_factory=list)

    @property
    def num_primary_elements(self) -> int:
        return len(self.primary_elements)

    def num_secondary_elements(self) -> int:
        return len(self.secondary_elements)

    @classmethod
    async def create(
        cls, grid_size: int, primary_elements: List[T], secondary_elements: List[T]
    ):
        instance = cls(
            grid_size=grid_size,
            primary_elements=primary_elements,
            secondary_elements=secondary_elements,
        )
        instance.primary_elements_on_diagonals = (
            await instance.__get_primary_elements_on_diagonals()
        )
        return instance

    async def __calculate_primary_element_distribution_by_id(
        self,
    ) -> List[List[Union[int, float]]]:
        """Computes the per-diagonal distribution matrix for each primary element ID.

        Calculates the distribution values (counts or proportions) across every
        grid diagonal for each primary element, indexed by the element's numerical ID.

        Returns:
            List[List[Union[int, float]]]: A 2D list where row `i` contains the distribution
            values across all diagonals for the primary element with ID `i`
            (i.e., `matrix[element_id][diagonal_idx]`).
        """

        if self.num_primary_elements == 0:
            return []

        ### 1. Estimate threshold for each element
        threshold = (self.grid_size * (self.grid_size + 1)) / self.num_primary_elements
        max_iterations = 5  # Prevent infinite loops
        iterations = 0

        while iterations < max_iterations:
            print(f"Estimated threshold for each element: {threshold}")
            iterations += 1

            # 2. Calculate the distribution for each element index ID
            distribution_by_id = []

            # Temporary buffer tracking row counts for the element currently being processed
            current_element_counts = []

            # Queue storing element totals/counts to be mirrored/reversed for the bottom half
            element_history_queue = []

            # Running total of squares/units processed so far
            current_element_total = 0

            for squares_in_row in range(1, self.grid_size + 1):
                # Special handling of final row for odd-numbered primary_elements
                if (
                    self.num_primary_elements % 2 == 1
                    and squares_in_row == self.grid_size
                ):
                    if self.num_primary_elements == squares_in_row:
                        if current_element_counts:
                            element_history_queue.append(current_element_counts[::-1])
                            distribution_by_id.append(current_element_counts)
                        distribution_by_id.append([squares_in_row])
                    else:
                        current_element_counts.append(squares_in_row * 0.25)
                        element_history_queue.append(current_element_counts[::-1])
                        distribution_by_id.append(current_element_counts)
                        distribution_by_id.append([squares_in_row * 0.5])

                    current_element_counts = []
                    current_element_total = 0

                # Logic to determine how many squares to assign to the current element based on threshold
                if current_element_total + squares_in_row == threshold:
                    current_element_counts.append(squares_in_row)
                    element_history_queue.append(current_element_counts[::-1])
                    distribution_by_id.append(current_element_counts)
                    current_element_counts = []
                    current_element_total = 0
                elif current_element_total + squares_in_row > threshold:
                    half = squares_in_row / 2
                    current_element_counts.append(half)
                    element_history_queue.append(current_element_counts[::-1])
                    distribution_by_id.append(current_element_counts)
                    current_element_counts = [half]
                    current_element_total = half
                else:
                    current_element_counts.append(squares_in_row)
                    current_element_total += squares_in_row

            # Reverse top half to mirror the bottom half of the grid
            while element_history_queue:
                distribution_by_id.append(element_history_queue.pop())

            if len(distribution_by_id) <= self.num_primary_elements:
                return distribution_by_id

            # If total element rows exceed num_primary_elements, adjust threshold and retry
            print(
                f"Threshold of {threshold} exceeded. Adjusting threshold and recalculating..."
            )
            threshold += 0.5
            await asyncio.sleep(0)

        if len(distribution_by_id) != self.num_primary_elements:
            print(
                f"❌ Unable to distribute {self.num_primary_elements} primary elements "
            )
            raise ValueError(
                f"Unable to distribute {self.num_primary_elements} primary elements "
                f"evenly on a {self.grid_size}x{self.grid_size} grid."
            )

        print("✅ Successfully calculated primary element distribution by ID.")
        return distribution_by_id

    async def __get_primary_elements_on_diagonals(self) -> List[List[Any]]:
        """Extracts primary element IDs grouped by grid diagonals.

        Iterates through the grid and collects primary element IDs along each
        diagonal, returning them as sublists ordered by 0-based diagonal index
        (from top-left to bottom-right).

        Returns:
            List[List[Any]]: A list of lists, where each inner list contains the
            primary element IDs located along a specific diagonal.
        """

        primary_elements_on_diagonals = []
        diagonal_index = 1
        primary_elements_on_curr_diagonal = []
        curr_squares_on_diagonal = 0.0

        distribution_by_id = await self.__calculate_primary_element_distribution_by_id()

        for element_id, square_counts in enumerate(distribution_by_id):
            # Determine which representation to store (value vs ID)
            element_val = element_id

            for square_count in square_counts:
                total_squares_on_diagonal = min(
                    diagonal_index, 2 * self.grid_size - diagonal_index
                )

                primary_elements_on_curr_diagonal.append(element_val)
                curr_squares_on_diagonal += square_count

                # Using math.isclose or rounding to handle minor float precision drift (e.g. 1.5 + 1.5 == 3.0)
                if round(curr_squares_on_diagonal, 5) == total_squares_on_diagonal:
                    primary_elements_on_diagonals.append(
                        primary_elements_on_curr_diagonal
                    )
                    primary_elements_on_curr_diagonal = []
                    curr_squares_on_diagonal = 0.0
                    diagonal_index += 1

        print("✅ Successfully generated primary elements on diagonals.")
        return primary_elements_on_diagonals

    def get_primary_elements_on_grid(
        self, resolve_elements: bool = True
    ) -> List[List[Any]]:
        """
        Returns a 2D grid representation of primary elements.

        :param resolve_elements: If True, returns list of actual primary_elements from self.primary_elements.
                                If False, returns average element IDs (indices).
        """

        grid = [[None for _ in range(self.grid_size)] for _ in range(self.grid_size)]

        for diagonal_idx, elements in enumerate(
            self.primary_elements_on_diagonals, start=1
        ):
            if not resolve_elements:
                if len(elements) == 1:
                    fill_vals = [elements[0]]
                else:
                    fill_vals = [
                        (elements[i - 1] + elements[i]) / 2
                        for i in range(1, len(elements))
                    ]
            else:
                if len(elements) == 1:
                    fill_vals = [[self.primary_elements[elements[0]]]]
                else:
                    fill_vals = [
                        [
                            self.primary_elements[elements[i - 1]],
                            self.primary_elements[elements[i]],
                        ]
                        for i in range(1, len(elements))
                    ]
            start_row = (
                0 if diagonal_idx <= self.grid_size else diagonal_idx - self.grid_size
            )
            diagonal_length = (
                diagonal_idx
                if diagonal_idx <= self.grid_size
                else 2 * self.grid_size - diagonal_idx
            )

            for k in range(diagonal_length):
                row = start_row + k
                col = diagonal_idx - 1 - row
                grid[row][col] = fill_vals[k % len(fill_vals)]

        print("✅ Successfully generated primary elements on grid.")
        return grid

    def __get_primary_elements_maps(
        self,
    ) -> Tuple[Dict[str, int], Dict[Tuple[int, int], str]]:
        """Generates count and placement mappings for primary elements on the grid.

        Returns:
            Tuple[Dict, Dict]: A two-element tuple containing:
                - primary_element_map: A dictionary mapping each primary element identifier
                to its total frequency count.
                - cell_primary_element_map: A dictionary mapping coordinate tuples `(row, col)`
                to their assigned primary element.
        """

        primary_element_map = defaultdict(int)
        cell_primary_element_map = {}

        for diagonal_index, p_elems in enumerate(
            self.primary_elements_on_diagonals, start=1
        ):
            total_cells_on_diagonal = min(
                diagonal_index, self.grid_size, 2 * self.grid_size - diagonal_index
            )
            start_row = (
                0
                if diagonal_index <= self.grid_size
                else diagonal_index - self.grid_size
            )

            if len(p_elems) == 1:
                elem_idx = p_elems[0]
                primary_element_map[elem_idx] += total_cells_on_diagonal
                fill_vals = [elem_idx]
            elif len(p_elems) == 2:
                elem_idx = sum(p_elems) / 2
                primary_element_map[elem_idx] += total_cells_on_diagonal
                fill_vals = [elem_idx]
            else:
                elem_idx = [i + 0.5 for i in p_elems[1:]]
                n_elems = len(elem_idx)
                base_count = total_cells_on_diagonal // n_elems
                remainder = total_cells_on_diagonal % n_elems

                for idx, val in enumerate(elem_idx):
                    primary_element_map[val] += base_count + (
                        1 if idx < remainder else 0
                    )
                fill_vals = elem_idx

            for k in range(total_cells_on_diagonal):
                row = start_row + k
                col = diagonal_index - 1 - row
                cell_primary_element_map[(row, col)] = fill_vals[k % len(fill_vals)]

        print("✅ Successfully generated primary element maps.")
        return dict(primary_element_map), cell_primary_element_map

    def __validate_secondary_distribution(self, primary_element_map: Dict) -> bool:
        """Validates whether secondary elements can be placed without violating adjacency constraints.

        Checks if a valid placement exists for secondary elements across the grid given
        the existing primary element positions, ensuring no two conflicting elements
        share adjacent cells.

        Args:
            primary_element_map: A mapping of primary elements to their
                assigned grid coordinates.

        Returns:
            True if a valid distribution of secondary elements exists; False otherwise.
        """

        # Rule 1: Absolute Floor for 8-Neighbor Grid Graph Coloring
        if self.num_secondary_elements() < 4:
            print(
                f"❌ Mathematical Failure: NUM_PATTERNS={self.num_secondary_elements()} is too low. "
                f"An 8-neighbor grid graph strictly requires AT LEAST 4 patterns to color."
            )
            return False

        # Rule 2: Global 8-Neighbor Pattern Packing Limit (25% Grid Bound)
        # An active cell invalidates all 8 surrounding cells, requiring a stride of >= 2
        # between active indices (e.g., [0, 2, 4, ...]).
        # This bounds maximal density to 1 cell per 2x2 region (~25%). math.ceil handles odd grid dimensions.
        max_allowed_per_s_elem = math.ceil(self.grid_size / 2) ** 2
        total_secondary_element_counts = [0] * self.num_secondary_elements()
        for count in primary_element_map.values():
            count_per_secondary = count // self.num_secondary_elements()
            remainder = count % self.num_secondary_elements()

            for s_elem_idx in range(self.num_secondary_elements()):
                total_secondary_element_counts[s_elem_idx] += count_per_secondary + (
                    1 if s_elem_idx < remainder else 0
                )

        for s_elem_idx, total_count in enumerate(total_secondary_element_counts):
            if total_count > max_allowed_per_s_elem:
                print(
                    f"❌ Mathematical Failure: Secondary element {s_elem_idx + 1} is assigned {total_count} total cells, "
                    f"but an 8-neighbor {self.grid_size}x{self.grid_size} grid can physically fit at most "
                    f"{max_allowed_per_s_elem} instances of a single secondary element."
                )
                return False

        # Rule 3: Primary Element-Local Diagonal Packing Limit
        # Primary elements on diagonals are clustered. Check if any primary element assigns more stock
        # to a single secondary pattern than can physically fit in that primary element's diagonal span.
        for primary_elem_idx, total_count in primary_element_map.items():
            # The MINIMUM workload placed on the busiest secondary pattern. (Pigeonhole Principle)
            # Under the most balanced distribution possible, at least one secondary pattern MUST
            # be used at least this many times to cover all `total_count` cells.
            # (Any unbalanced distribution would only increase this number).
            max_stock_for_s_elem = math.ceil(
                total_count / self.num_secondary_elements()
            )

            # Absolute physical capacity for any single secondary pattern within this color.
            # Under 8-neighbor rules, cells with the same secondary pattern along a diagonal must skip
            # every other cell (stride >= 2), capping max placements at ceil(total_count / 2).
            max_possible_in_diagonal = math.ceil(total_count / 2)

            if max_stock_for_s_elem > max_possible_in_diagonal:
                print(
                    f"❌ Mathematical Failure: Primary element {primary_elem_idx} has {total_count} cells. "
                    f"Its inventory requires a single secondary element {max_stock_for_s_elem} times, "
                    f"but at most {max_possible_in_diagonal} non-adjacent placements are possible."
                )
                return False

        print("✅ Successfully validated primary element distribution.")
        return True

    def __get_neighbour_map(self):
        """Generates an adjacency lookup map for all valid grid coordinates.

        Iterates through each cell in the square grid and calculates its valid
        8-directional neighbors (Moore neighborhood), ensuring boundary conditions
        are respected.

        Returns:
            dict[tuple[int, int], list[tuple[int, int]]]: A dictionary mapping each
            cell coordinate tuple `(r, c)` to a list of its valid neighboring coordinate
            tuples `[(nr, nc), ...]`.
        """

        neighbor_map = {}
        for r in range(self.grid_size):
            for c in range(self.grid_size):
                coords = []
                for dr in (-1, 0, 1):
                    for dc in (-1, 0, 1):
                        if dr == 0 and dc == 0:
                            continue
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < self.grid_size and 0 <= nc < self.grid_size:
                            coords.append((nr, nc))
                neighbor_map[(r, c)] = coords

        print("✅ Successfully generated neighbor map for grid cells.")
        return neighbor_map

    def __get_secondary_elements_inventory(
        self, primary_element_map: Dict[str, int]
    ) -> Dict[str, List[int]]:
        """
        Generates a mapping of secondary element inventory for each primary element.

        Args:
            primary_element_map (Dict[str, int]): A dictionary mapping primary element identifiers
                to their respective counts.

        Returns:
            Dict[str, List[int]]: A dictionary mapping each primary element to a list of inventory counts for each secondary element.
        """
        secondary_inventory_map = {}
        curr_total_s_elems = [0] * self.num_secondary_elements()

        for p_elem, count in primary_element_map.items():
            count_per_s_elem = count // self.num_secondary_elements()
            secondary_inventory_map[p_elem] = [
                count_per_s_elem
            ] * self.num_secondary_elements()
            curr_total_s_elems = [
                curr + count_per_s_elem for curr in curr_total_s_elems
            ]

            remainder = count % self.num_secondary_elements()
            if remainder > 0:
                start_s_elem = min(
                    curr_total_s_elems.index(min(curr_total_s_elems)),
                    self.num_secondary_elements() - 1,
                )
                for i in range(remainder):
                    idx = (start_s_elem + i) % self.num_secondary_elements()
                    secondary_inventory_map[p_elem][idx] += 1
                    curr_total_s_elems[idx] += 1

        print("✅ Successfully generated secondary elements inventory mapping.")
        return secondary_inventory_map

    def __get_empty_s_elem_cells(
        self,
        curr_s_elem_grid: List[List[Any]],
        cell_primary_element_map: Dict[Tuple[int, int], str],
        secondary_inventory_map: Dict[str, List[int]],
    ) -> Tuple[Dict[str, set], set]:
        """
        Identifies empty and filled cells for secondary elements, with respect to their primary elements in the grid. To support fast global inventory pruning.

        Args:
            curr_s_elem_grid (List[List[Any]]): The current grid of secondary elements.
            cell_primary_element_map (Dict[Tuple[int, int], str]): A mapping of grid coordinates to their corresponding primary elements.
            secondary_inventory_map (Dict[str, List[int]]): A mapping of primary elements to their respective secondary element inventories.

        Returns:
            Tuple[Dict[str, set], set]: A tuple containing:
                empty_cells_by_p_elem: A dictionary mapping each primary element to a set of coordinates of empty cells.
                - empty_cells: A set of coordinates representing empty cells in the grid.
        """

        empty_cells_by_p_elem = defaultdict(set)
        empty_cells = set()

        for r in range(self.grid_size):
            for c in range(self.grid_size):
                s_elem = curr_s_elem_grid[r][c]
                p_elem = cell_primary_element_map.get((r, c))

                if s_elem is not None:
                    secondary_inventory_map[p_elem][s_elem] -= 1
                else:
                    empty_cells.add((r, c))
                    empty_cells_by_p_elem[p_elem].add((r, c))

        print(
            "✅ Successfully identified empty and filled cells for secondary elements."
        )
        return empty_cells_by_p_elem, empty_cells

    def __get_cell_s_elem_domains(
        self, empty_cells: set, curr_grid: List[List[Any]], neighbour_map
    ) -> Dict[Tuple[int, int], set]:
        """
        Computes the legal candidate values (domains) for each empty cell in the grid.

        Args:
            empty_cells (set): A set of coordinates representing empty cells in the grid.
            cell_primary_element_map (Dict[Tuple[int, int], str]): A mapping of grid coordinates to their corresponding primary elements.
            curr_grid (List[List[Any]]): The current grid of secondary elements.

        Returns:
            Dict[Tuple[int, int], set]: A dictionary mapping each empty cell to its set of valid secondary elements.
        """
        s_elem_domains = {}
        for r, c in empty_cells:
            used_neighbours = {
                curr_grid[nr][nc]
                for nr, nc in neighbour_map.get((r, c), [])
                if curr_grid[nr][nc] is not None
            }
            s_elem_domains[(r, c)] = {
                s_elem
                for s_elem in range(self.num_secondary_elements())
                if s_elem not in used_neighbours
            }

        print(
            "✅ Successfully computed legal candidate values (domains) for each empty cell."
        )
        return s_elem_domains

    async def get_secondary_elements_on_grid(
        self, s_elem_grid: List[List[int]] = None
    ) -> List[List[int]]:
        """
        Returns a 2D grid representation of secondary elements.
        The distribution is randomized while ensuring no two identical secondary elements are adjacent.
        """
        grid = (
            [[None for _ in range(self.grid_size)] for _ in range(self.grid_size)]
            if s_elem_grid is None
            else s_elem_grid
        )

        primary_element_map, cell_primary_element_map = (
            self.__get_primary_elements_maps()
        )

        # Validate feasibility of distribution
        if not self.__validate_secondary_distribution(primary_element_map):
            print("❌ Pattern assignment aborted due to mathematical infeasibility.")
            return grid

        secondary_inventory_map = self.__get_secondary_elements_inventory(
            primary_element_map
        )
        neighbour_map = self.__get_neighbour_map()
        empty_cells_by_p_elem, empty_cells = self.__get_empty_s_elem_cells(
            grid, cell_primary_element_map, secondary_inventory_map
        )
        s_elem_domains = self.__get_cell_s_elem_domains(
            empty_cells, grid, neighbour_map
        )
        await asyncio.sleep(0)

        backtrack_iterations = 0

        async def backtrack():
            nonlocal backtrack_iterations
            backtrack_iterations += 1

            if backtrack_iterations % 5000 == 0:
                print(
                    f"\rBacktracking iterations: {backtrack_iterations:<7} | Empty remaining: {len(empty_cells):<3}",
                    end="",
                )
                sys.stdout.flush()
                await asyncio.sleep(0)
            if backtrack_iterations > 10000:
                return False

            if not empty_cells:
                return True  # All cells filled successfully

            # Select the next cell to fill (using MRV heuristic)
            best_cell = min(
                empty_cells,
                key=lambda c: (
                    len(s_elem_domains[c]),
                    sum(
                        1
                        for count in secondary_inventory_map[
                            cell_primary_element_map[c]
                        ]
                        if count > 0
                    ),
                ),
            )
            candidates = list(s_elem_domains[best_cell])
            if not candidates:
                return False  # No valid secondary elements for this cell

            r, c = best_cell
            p_elem = cell_primary_element_map[best_cell]
            random.shuffle(candidates)  # Randomize candidate order for diversity

            empty_cells.remove(best_cell)  # Mark cell as filled
            empty_cells_by_p_elem[p_elem].remove(
                best_cell
            )  # Mark cell as filled for this primary element

            for s_elem in candidates:
                # Skip if no stock available for this secondary element under the current primary element
                if secondary_inventory_map[p_elem][s_elem] <= 0:
                    continue  # Skip if no stock available

                grid[r][c] = s_elem
                secondary_inventory_map[p_elem][s_elem] -= 1
                stock_depleted = secondary_inventory_map[p_elem][s_elem] == 0

                # Constraint Propogation Trackers
                pruned_adj = []
                pruned_global = []
                is_valid = True

                # 1. Propagate constraints to adjacent cells
                for nr, nc in neighbour_map.get((r, c), []):
                    if (nr, nc) in empty_cells and s_elem in s_elem_domains[(nr, nc)]:
                        s_elem_domains[(nr, nc)].remove(s_elem)
                        pruned_adj.append((nr, nc))
                        if not s_elem_domains[(nr, nc)]:
                            is_valid = False
                            break

                # 2. Propagate global stock constraints
                if is_valid and stock_depleted:
                    for empty_cell in empty_cells_by_p_elem[p_elem]:
                        if s_elem in s_elem_domains[empty_cell]:
                            s_elem_domains[empty_cell].remove(s_elem)
                            pruned_global.append(empty_cell)
                            if not s_elem_domains[empty_cell]:
                                is_valid = False
                                break
                if is_valid and (await backtrack()):
                    return True  # Successful assignment

                # Rollback changes if assignment failed
                grid[r][c] = None  # Reset cell
                secondary_inventory_map[p_elem][s_elem] += 1  # Restore stock
                for cell in pruned_adj:
                    s_elem_domains[cell].add(s_elem)
                for cell in pruned_global:
                    s_elem_domains[cell].add(s_elem)

            empty_cells.add(best_cell)  # Restore cell to empty set
            empty_cells_by_p_elem[p_elem].add(
                best_cell
            )  # Restore cell to empty set for this primary element
            return False  # No valid assignment found for this cell

        iterations = 0
        success = False
        while iterations < 3:
            if await backtrack():
                print(
                    f"\n✅ Successfully assigned secondary elements in {backtrack_iterations} iterations."
                )
                success = True
                return grid
            else:
                print(
                    f"\n⚠️ Backtracking failed on attempt {iterations + 1}. Retrying..."
                )
                # Reset grid and state for another attempt
                grid = [
                    [None for _ in range(self.grid_size)] for _ in range(self.grid_size)
                ]
                secondary_inventory_map = self.__get_secondary_elements_inventory(
                    primary_element_map
                )
                empty_cells_by_p_elem, empty_cells = self.__get_empty_s_elem_cells(
                    grid, cell_primary_element_map, secondary_inventory_map
                )
                s_elem_domains = self.__get_cell_s_elem_domains(
                    empty_cells, grid, neighbour_map
                )
                backtrack_iterations = 0
                iterations += 1

        if not success:
            print(
                f"\n❌ Failed to assign secondary elements after {iterations} attempts and {backtrack_iterations} backtracking iterations."
            )

        print("⚠️ Returning the best-effort grid (may contain unfilled cells).")
        return grid
