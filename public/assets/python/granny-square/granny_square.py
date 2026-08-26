from typing import List
import string

from diagonal_grid import DiagonalGrid


class PatternedColouredGrannySquare:
    grid_size: int = 0
    palette: List[str] = []
    colours: int = len(palette)
    patterns: List[str] = []
    diagonal_grid: DiagonalGrid
    s_elem_grid: List[List[str]] = None

    def __init__(
        self,
        grid_size: int,
        palette: List[str],
        numPatterns: int,
        diagonal_grid: DiagonalGrid,
        s_elem_grid: List[List[str]] = None,
    ):
        self.grid_size = grid_size
        self.colours = len(palette)
        self.palette = palette
        self.patterns = string.ascii_lowercase[:numPatterns]
        self.diagonal_grid = diagonal_grid
        self.s_elem_grid = s_elem_grid

    @classmethod
    async def create(
        cls,
        grid_size: int,
        palette: List[str],
        numPatterns: int,
        s_elem_grid: List[List[str]] = None,
    ):
        diagonal_grid = await DiagonalGrid.create(
            grid_size, palette, string.ascii_lowercase[:numPatterns]
        )
        return cls(grid_size, palette, numPatterns, diagonal_grid, s_elem_grid)

    async def get_granny_square_data(self):
        colour_grid = self.diagonal_grid.get_primary_elements_on_grid(
            resolve_elements=True
        )
        pattern_grid = await self.diagonal_grid.get_secondary_elements_on_grid(
            self.s_elem_grid
        )
        pattern_grid = [[elem + 1 if elem is not None else "" for elem in row] for row in pattern_grid]
        return colour_grid, pattern_grid
